"""
ACORD 126 extractor implementation.

Orchestrates the extraction workflow:
1. Parse PDF fields
2. Map to canonical JSON
3. Calculate confidence
4. Return structured result
"""

import os
from typing import Dict, Any
from ..interfaces.extractor import IExtractor
from ..interfaces.parser import IParser
from ..interfaces.mapper import IMapper
from ..models.extraction_result import ExtractionResult
from ..parsers.pdf_field_parser import PdfFieldParser
from ..mappers.acord_126_extraction_mapper import Acord126ExtractionMapper


class Acord126Extractor(IExtractor):
    """
    Extractor for ACORD 126 (Commercial General Liability Application).
    
    Coordinates PDF parsing and JSON mapping to produce
    structured extraction results.
    """
    
    def __init__(
        self,
        parser: IParser = None,
        mapper: IMapper = None
    ):
        """
        Initialize extractor with dependencies.
        
        Args:
            parser: PDF parser (defaults to PdfFieldParser)
            mapper: Field mapper (defaults to Acord126ExtractionMapper)
        """
        self.parser = parser or PdfFieldParser()
        self.mapper = mapper or Acord126ExtractionMapper()
    
    def get_supported_form_type(self) -> str:
        """Return form type this extractor supports."""
        return "126"
    
    def can_extract(self, pdf_path: str) -> bool:
        """
        Check if this extractor can handle the given PDF.
        
        For ACORD 126, we check:
        1. PDF exists
        2. PDF has fillable fields
        3. PDF contains ACORD 126 indicators (future: use classifier)
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            True if this extractor can process the PDF
        """
        # Check file exists
        if not os.path.exists(pdf_path):
            return False
        
        # Check if fillable
        if not self.parser.is_fillable(pdf_path):
            return False
        
        # For MVP: assume fillable PDF is ACORD 126
        # Future: add proper classification logic
        return True
    
    def extract(self, pdf_path: str) -> ExtractionResult:
        """
        Extract data from ACORD 126 PDF.
        
        Workflow:
        1. Validate PDF
        2. Parse PDF fields
        3. Map to canonical JSON
        4. Calculate confidence
        5. Return result with metadata
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            ExtractionResult containing:
            - json: Canonical JSON structure
            - confidence: Extraction confidence score
            - warnings: List of warnings
            - metadata: Extraction metadata
        """
        try:
            # Step 1: Validate
            if not os.path.exists(pdf_path):
                return ExtractionResult(
                    json={},
                    confidence=0.0,
                    error=f"PDF file not found: {pdf_path}"
                )
            
            # Step 2: Parse PDF fields
            raw_fields = self.parser.extract_fields(pdf_path)
            
            if not raw_fields:
                return ExtractionResult(
                    json={},
                    confidence=0.0,
                    warnings=["No fields extracted from PDF"],
                    error="PDF has no readable fields"
                )
            
            # Step 3: Map to canonical JSON
            canonical_json = self.mapper.map_to_canonical(raw_fields)
            
            # Step 4: Calculate confidence and collect warnings
            confidence = self._calculate_confidence(raw_fields, canonical_json)
            warnings = self._collect_warnings(raw_fields, canonical_json)
            
            # Step 5: Build metadata
            metadata = {
                "total_fields_extracted": len(raw_fields),
                "form_type": self.get_supported_form_type(),
                "pdf_path": pdf_path,
                "pdf_filename": os.path.basename(pdf_path)
            }
            
            # Step 6: Return result
            return ExtractionResult(
                json=canonical_json,
                confidence=confidence,
                warnings=warnings,
                metadata=metadata
            )
            
        except ValueError as e:
            # Validation or parsing error
            return ExtractionResult(
                json={},
                confidence=0.0,
                error=str(e)
            )
        except Exception as e:
            # Unexpected error
            return ExtractionResult(
                json={},
                confidence=0.0,
                error=f"Extraction failed: {str(e)}"
            )
    
    def _calculate_confidence(
        self,
        raw_fields: Dict[str, Any],
        canonical_json: Dict[str, Any]
    ) -> float:
        """
        Calculate extraction confidence score.
        
        Confidence based on:
        - Number of fields extracted
        - Presence of required fields
        - Data quality indicators
        
        Args:
            raw_fields: Raw PDF fields extracted
            canonical_json: Mapped canonical JSON
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        # Define critical fields that should be present
        critical_fields = [
            "applicant.business_name",
            "limits.each_occurrence",
            "limits.general_aggregate"
        ]
        
        # Count how many critical fields have values
        critical_found = 0
        for field_path in critical_fields:
            value = self._get_nested_value(canonical_json, field_path)
            if value:
                critical_found += 1
        
        # Base confidence on critical fields presence
        base_confidence = critical_found / len(critical_fields)
        
        # Bonus for having many fields extracted
        field_count = len(raw_fields)
        if field_count > 100:
            field_bonus = 0.2
        elif field_count > 50:
            field_bonus = 0.1
        else:
            field_bonus = 0.0
        
        # Calculate final confidence (capped at 1.0)
        confidence = min(base_confidence + field_bonus, 1.0)
        
        return round(confidence, 2)
    
    def _collect_warnings(
        self,
        raw_fields: Dict[str, Any],
        canonical_json: Dict[str, Any]
    ) -> list:
        """
        Collect warnings about extraction quality.
        
        Args:
            raw_fields: Raw PDF fields extracted
            canonical_json: Mapped canonical JSON
            
        Returns:
            List of warning messages
        """
        warnings = []
        
        # Check for missing critical fields
        critical_fields = {
            "applicant.business_name": "Business name",
            "limits.each_occurrence": "Each occurrence limit",
            "limits.general_aggregate": "General aggregate limit"
        }
        
        for field_path, field_label in critical_fields.items():
            value = self._get_nested_value(canonical_json, field_path)
            if not value:
                warnings.append(f"Missing critical field: {field_label}")
        
        # Check for low field count
        if len(raw_fields) < 20:
            warnings.append(
                f"Low field count ({len(raw_fields)}). PDF may be incomplete or blank."
            )
        
        # Check for missing coverage type selection
        occurrence = canonical_json.get("coverage_type", {}).get("occurrence")
        claims_made = canonical_json.get("coverage_type", {}).get("claims_made")
        
        if not occurrence and not claims_made:
            warnings.append("No coverage type selected (Occurrence or Claims Made)")
        
        return warnings
    
    def _get_nested_value(self, obj: Dict[str, Any], path: str) -> Any:
        """
        Get nested value from dictionary using dot notation.
        
        Args:
            obj: Dictionary to traverse
            path: Dot-separated path (e.g., "applicant.business_name")
            
        Returns:
            Value at path or None if not found
        """
        keys = path.split('.')
        current = obj
        
        for key in keys:
            if isinstance(current, dict) and key in current:
                current = current[key]
            else:
                return None
        
        return current