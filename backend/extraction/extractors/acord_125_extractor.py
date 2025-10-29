"""
ACORD 125 extractor for Commercial Insurance Application forms.

Extracts applicant and coverage information from ACORD 125 forms.
"""

from typing import Dict, Any, List
from datetime import datetime
from ..interfaces.extractor import IExtractor
from ..core.document import Document, DocumentType
from ..models.extraction_result import ExtractionResult
from ..parsers import PdfFieldParser, OcrFallbackParser


class Acord125Extractor(IExtractor):
    """
    Extractor for ACORD 125 Commercial Insurance Application forms.
    
    Extracts:
    - Applicant information
    - Business details
    - Coverage requirements
    - Prior insurance history
    - Loss information
    """
    
    # Field mappings for ACORD 125
    FIELD_MAPPINGS = {
        # Applicant Information
        'applicant_name': [
            'Named Insured',
            'Applicant',
            'Company Name',
        ],
        'mailing_address': [
            'Mailing Address',
            'Address',
        ],
        'city': ['City'],
        'state': ['State'],
        'zip': ['ZIP', 'Zip Code'],
        'phone': ['Phone', 'Telephone'],
        'fax': ['Fax'],
        'email': ['Email', 'E-mail'],
        'website': ['Website', 'Web Site'],
        
        # Business Information
        'business_description': [
            'Business Description',
            'Description of Operations',
        ],
        'years_in_business': [
            'Years in Business',
            'Years Experience',
        ],
        'number_of_employees': [
            'Number of Employees',
            'Total Employees',
        ],
        'annual_revenue': [
            'Annual Revenue',
            'Annual Sales',
            'Gross Receipts',
        ],
        'federal_id': [
            'Federal ID',
            'FEIN',
            'Tax ID',
        ],
        
        # Coverage Information
        'general_liability': ['General Liability'],
        'property': ['Property'],
        'auto': ['Auto', 'Automobile'],
        'workers_comp': ['Workers Compensation', "Workers' Comp"],
        'umbrella': ['Umbrella', 'Excess Liability'],
        'professional_liability': ['Professional Liability', 'E&O'],
        
        # Policy Information
        'effective_date': [
            'Effective Date',
            'Desired Effective Date',
        ],
        'expiration_date': [
            'Expiration Date',
        ],
        
        # Prior Insurance
        'current_carrier': [
            'Current Carrier',
            'Prior Carrier',
        ],
        'prior_policy_number': [
            'Prior Policy Number',
            'Policy Number',
        ],
        
        # Loss History
        'losses_last_5_years': [
            'Losses - Last 5 Years',
            'Number of Losses',
        ],
    }
    
    def __init__(self):
        """Initialize ACORD 125 extractor."""
        self.pdf_parser = PdfFieldParser()
        self.ocr_parser = OcrFallbackParser()
    
    def extract(self, document: Document) -> ExtractionResult:
        """
        Extract ACORD 125 data from document.
        
        Args:
            document: Document object with ACORD 125 content
            
        Returns:
            ExtractionResult with extracted data
        """
        try:
            # Verify document type
            if document.document_type != DocumentType.ACORD_125:
                return ExtractionResult(
                    success=False,
                    data={},
                    errors=[f"Expected ACORD_125, got {document.document_type.value}"]
                )
            
            # Try fillable field extraction first
            if self.pdf_parser.is_fillable(document.file_path):
                result = self._extract_from_fillable_fields(document)
                if result.success:
                    return result
            
            # Fallback to OCR
            result = self._extract_from_ocr(document)
            return result
            
        except Exception as e:
            return ExtractionResult(
                success=False,
                data={},
                errors=[f"ACORD 125 extraction failed: {str(e)}"]
            )
    
    def can_extract(self, document: Document) -> bool:
        """Check if can extract from document."""
        return document.document_type == DocumentType.ACORD_125
    
    def get_supported_types(self) -> List[DocumentType]:
        """Get supported document types."""
        return [DocumentType.ACORD_125]
    
    def _extract_from_fillable_fields(self, document: Document) -> ExtractionResult:
        """Extract from fillable PDF fields."""
        raw_fields = self.pdf_parser.extract_fields(document.file_path)
        
        if not raw_fields:
            return ExtractionResult(
                success=False,
                data={},
                errors=["No fillable fields found"]
            )
        
        # Map fields
        mapped_data = self._map_fields(raw_fields)
        
        # Structure data
        structured_data = {
            'document_type': 'acord_125',
            'extraction_date': datetime.utcnow().isoformat(),
            'applicant_information': self._extract_applicant_info(mapped_data),
            'business_information': self._extract_business_info(mapped_data),
            'coverage_requirements': self._extract_coverage_info(mapped_data),
            'policy_information': self._extract_policy_info(mapped_data),
            'prior_insurance': self._extract_prior_insurance(mapped_data),
            'raw_fields': raw_fields,
        }
        
        return ExtractionResult(
            success=True,
            data=structured_data,
            confidence=self._calculate_confidence(structured_data)
        )
    
    def _extract_from_ocr(self, document: Document) -> ExtractionResult:
        """Extract using OCR (fallback)."""
        warnings = ["Using OCR extraction - may be less accurate"]
        
        # Use OCR to get text
        ocr_result = self.ocr_parser.extract_fields(document.file_path)
        text = ocr_result.get('text', '')
        
        if not text:
            return ExtractionResult(
                success=False,
                data={},
                errors=["No text extracted via OCR"]
            )
        
        # Extract data from text
        extracted_data = self._extract_from_text(text)
        
        structured_data = {
            'document_type': 'acord_125',
            'extraction_date': datetime.utcnow().isoformat(),
            'applicant_information': extracted_data.get('applicant_information', {}),
            'business_information': extracted_data.get('business_information', {}),
            'coverage_requirements': extracted_data.get('coverage_requirements', {}),
            'raw_text': text,
        }
        
        return ExtractionResult(
            success=True,
            data=structured_data,
            warnings=warnings,
            confidence=0.6  # Lower confidence for OCR
        )
    
    def _map_fields(self, raw_fields: Dict[str, Any]) -> Dict[str, Any]:
        """Map raw PDF fields to standard field names."""
        mapped = {}
        
        for standard_field, possible_names in self.FIELD_MAPPINGS.items():
            for possible_name in possible_names:
                if possible_name in raw_fields:
                    mapped[standard_field] = raw_fields[possible_name]
                    break
        
        return mapped
    
    def _extract_applicant_info(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract applicant information."""
        return {
            'name': data.get('applicant_name', ''),
            'mailing_address': data.get('mailing_address', ''),
            'city': data.get('city', ''),
            'state': data.get('state', ''),
            'zip': data.get('zip', ''),
            'phone': data.get('phone', ''),
            'fax': data.get('fax', ''),
            'email': data.get('email', ''),
            'website': data.get('website', ''),
        }
    
    def _extract_business_info(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract business information."""
        return {
            'description': data.get('business_description', ''),
            'years_in_business': data.get('years_in_business', ''),
            'number_of_employees': data.get('number_of_employees', ''),
            'annual_revenue': data.get('annual_revenue', ''),
            'federal_id': data.get('federal_id', ''),
        }
    
    def _extract_coverage_info(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract coverage requirements."""
        return {
            'general_liability': bool(data.get('general_liability')),
            'property': bool(data.get('property')),
            'auto': bool(data.get('auto')),
            'workers_comp': bool(data.get('workers_comp')),
            'umbrella': bool(data.get('umbrella')),
            'professional_liability': bool(data.get('professional_liability')),
        }
    
    def _extract_policy_info(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract policy information."""
        return {
            'effective_date': data.get('effective_date', ''),
            'expiration_date': data.get('expiration_date', ''),
        }
    
    def _extract_prior_insurance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract prior insurance information."""
        return {
            'current_carrier': data.get('current_carrier', ''),
            'prior_policy_number': data.get('prior_policy_number', ''),
            'losses_last_5_years': data.get('losses_last_5_years', ''),
        }
    
    def _extract_from_text(self, text: str) -> Dict[str, Any]:
        """Extract data from raw text (OCR)."""
        # Basic text-based extraction
        import re
        
        data = {
            'applicant_information': {},
            'business_information': {},
            'coverage_requirements': {},
        }
        
        # Extract applicant name
        name_match = re.search(r'Named Insured[:\s]+([^\n]+)', text, re.IGNORECASE)
        if name_match:
            data['applicant_information']['name'] = name_match.group(1).strip()
        
        # Extract phone
        phone_match = re.search(r'Phone[:\s]+([0-9\-\(\)\s]+)', text, re.IGNORECASE)
        if phone_match:
            data['applicant_information']['phone'] = phone_match.group(1).strip()
        
        # Extract business description
        desc_match = re.search(r'Business Description[:\s]+([^\n]+)', text, re.IGNORECASE)
        if desc_match:
            data['business_information']['description'] = desc_match.group(1).strip()
        
        return data
    
    def _calculate_confidence(self, data: Dict[str, Any]) -> float:
        """Calculate extraction confidence."""
        confidence = 0.7  # Base confidence
        
        # Bonus for applicant info
        applicant = data.get('applicant_information', {})
        if applicant.get('name'):
            confidence += 0.1
        
        # Bonus for business info
        business = data.get('business_information', {})
        if business.get('description'):
            confidence += 0.1
        
        # Bonus for coverage info
        coverage = data.get('coverage_requirements', {})
        if any(coverage.values()):
            confidence += 0.05
        
        return min(1.0, confidence)
    
    def __repr__(self) -> str:
        return "Acord125Extractor()"