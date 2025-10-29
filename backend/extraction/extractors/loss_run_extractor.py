"""
Loss Run extractor for insurance claim history documents.

Extracts claim data from loss run reports in various formats:
- Table-based loss runs (most common)
- Text-based loss runs
- Multi-page loss runs with claim details
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from ..interfaces.extractor import IExtractor
from ..core.document import Document, DocumentType
from ..models.extraction_result import ExtractionResult
from ..parsers import TableParser, OcrFallbackParser


class LossRunExtractor(IExtractor):
    """
    Extractor for Loss Run documents.
    
    Extracts claim history data including:
    - Claim details (date, number, amount, status)
    - Claimant information
    - Policy information
    - Totals and summaries
    
    Supports multiple formats and layouts.
    """
    
    # Common column header patterns
    COLUMN_PATTERNS = {
        'claim_number': [
            r'claim.*(?:number|no|id|#)',
            r'(?:claim|file).*#',
        ],
        'date_of_loss': [
            r'(?:date|dt).*(?:loss|accident|incident|occurrence)',
            r'loss.*date',
            r'accident.*date',
        ],
        'claim_amount': [
            r'(?:claim|loss).*amount',
            r'(?:paid|incurred|total).*amount',
            r'amount.*(?:paid|incurred)',
        ],
        'paid': [
            r'(?:amount.*)?paid',
            r'total.*paid',
        ],
        'incurred': [
            r'(?:amount.*)?incurred',
            r'total.*incurred',
        ],
        'reserve': [
            r'(?:case.*)?reserve',
            r'outstanding',
        ],
        'status': [
            r'claim.*status',
            r'status',
        ],
        'claimant': [
            r'claimant.*name',
            r'claimant',
        ],
        'description': [
            r'(?:description|desc).*(?:loss|claim)',
            r'loss.*(?:description|desc)',
            r'accident.*description',
        ],
        'policy_number': [
            r'policy.*(?:number|no|#)',
        ],
        'date_reported': [
            r'(?:date|dt).*(?:report|notif)',
            r'report.*date',
        ],
    }
    
    def __init__(self):
        """Initialize Loss Run extractor."""
        self.table_parser = TableParser(flavor='auto', min_confidence=60.0)
        self.ocr_parser = OcrFallbackParser()
    
    def extract(self, document: Document) -> ExtractionResult:
        """
        Extract loss run data from document.
        
        Args:
            document: Document object with loss run content
            
        Returns:
            ExtractionResult with extracted claim data
        """
        try:
            # Verify document type
            if document.document_type != DocumentType.LOSS_RUN:
                return ExtractionResult(
                    success=False,
                    data={},
                    errors=[f"Expected LOSS_RUN document, got {document.document_type.value}"]
                )
            
            # Extract from tables (primary method)
            if document.tables:
                result = self._extract_from_tables(document)
                if result.success:
                    return result
            
            # Fallback: Extract from text
            if document.raw_text:
                result = self._extract_from_text(document)
                if result.success:
                    return result
            
            return ExtractionResult(
                success=False,
                data={},
                errors=["No extractable loss run data found"]
            )
            
        except Exception as e:
            return ExtractionResult(
                success=False,
                data={},
                errors=[f"Extraction failed: {str(e)}"]
            )
    
    def can_extract(self, document: Document) -> bool:
        """Check if can extract from document."""
        return (
            document.document_type == DocumentType.LOSS_RUN and
            (bool(document.tables) or bool(document.raw_text))
        )
    
    def get_supported_types(self) -> List[DocumentType]:
        """Get supported document types."""
        return [DocumentType.LOSS_RUN]
    
    def _extract_from_tables(self, document: Document) -> ExtractionResult:
        """Extract claims from table data."""
        claims = []
        warnings = []
        
        for table_idx, table in enumerate(document.tables):
            # Map columns to fields
            column_map = self._map_columns(table.headers)
            
            if not column_map:
                warnings.append(f"Table {table_idx}: Could not map columns to claim fields")
                continue
            
            # Extract claims from rows
            for row_idx, row in enumerate(table.rows):
                try:
                    claim = self._extract_claim_from_row(row, column_map, table.headers)
                    if claim and self._is_valid_claim(claim):
                        claim['_source'] = {
                            'table_index': table_idx,
                            'row_index': row_idx
                        }
                        claims.append(claim)
                except Exception as e:
                    warnings.append(f"Table {table_idx}, Row {row_idx}: {str(e)}")
        
        if not claims:
            return ExtractionResult(
                success=False,
                data={},
                errors=["No valid claims found in tables"]
            )
        
        # Calculate totals
        totals = self._calculate_totals(claims)
        
        # Extract policy info
        policy_info = self._extract_policy_info(document)
        
        data = {
            'document_type': 'loss_run',
            'extraction_date': datetime.utcnow().isoformat(),
            'policy_information': policy_info,
            'claims': claims,
            'claim_count': len(claims),
            'totals': totals,
        }
        
        return ExtractionResult(
            success=True,
            data=data,
            warnings=warnings,
            confidence=self._calculate_confidence(claims, warnings)
        )
    
    def _extract_from_text(self, document: Document) -> ExtractionResult:
        """Extract claims from raw text (fallback method)."""
        # Simple text-based extraction
        # This is a basic implementation - can be enhanced
        
        text = document.raw_text
        claims = []
        warnings = ["Using text-based extraction - may be less accurate"]
        
        # Look for claim patterns in text
        # TODO: Implement regex-based claim extraction from text
        
        return ExtractionResult(
            success=False,
            data={},
            errors=["Text-based extraction not fully implemented"],
            warnings=warnings
        )
    
    def _map_columns(self, headers: List[str]) -> Dict[str, int]:
        """Map table columns to claim fields."""
        column_map = {}
        headers_lower = [h.lower() for h in headers]
        
        for field, patterns in self.COLUMN_PATTERNS.items():
            for col_idx, header in enumerate(headers_lower):
                for pattern in patterns:
                    import re
                    if re.search(pattern, header, re.IGNORECASE):
                        column_map[field] = col_idx
                        break
                if field in column_map:
                    break
        
        return column_map
    
    def _extract_claim_from_row(
        self,
        row: List[str],
        column_map: Dict[str, int],
        headers: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Extract claim data from table row."""
        claim = {}
        
        # Extract mapped fields
        for field, col_idx in column_map.items():
            if col_idx < len(row):
                value = row[col_idx].strip()
                if value:
                    claim[field] = value
        
        # Parse dates
        for date_field in ['date_of_loss', 'date_reported']:
            if date_field in claim:
                claim[date_field] = self._parse_date(claim[date_field])
        
        # Parse amounts
        for amount_field in ['claim_amount', 'paid', 'incurred', 'reserve']:
            if amount_field in claim:
                claim[amount_field] = self._parse_amount(claim[amount_field])
        
        return claim if claim else None
    
    def _is_valid_claim(self, claim: Dict[str, Any]) -> bool:
        """Check if claim data is valid."""
        # Must have at least claim number or date of loss
        has_identifier = bool(claim.get('claim_number') or claim.get('date_of_loss'))
        
        # Must have at least one amount field
        has_amount = any(
            claim.get(field) is not None
            for field in ['claim_amount', 'paid', 'incurred', 'reserve']
        )
        
        return has_identifier and has_amount
    
    def _parse_date(self, date_str: str) -> Optional[str]:
        """Parse date string to ISO format."""
        if not date_str:
            return None
        
        # Common date formats
        formats = [
            '%m/%d/%Y',
            '%m-%d-%Y',
            '%Y-%m-%d',
            '%m/%d/%y',
            '%d/%m/%Y',
            '%B %d, %Y',
            '%b %d, %Y',
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str.strip(), fmt)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        return date_str  # Return original if can't parse
    
    def _parse_amount(self, amount_str: str) -> Optional[float]:
        """Parse amount string to float."""
        if not amount_str:
            return None
        
        # Remove currency symbols and commas
        import re
        cleaned = re.sub(r'[$,\s]', '', amount_str)
        
        # Handle parentheses as negative
        if '(' in cleaned and ')' in cleaned:
            cleaned = '-' + cleaned.replace('(', '').replace(')', '')
        
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    def _calculate_totals(self, claims: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate total amounts from claims."""
        totals = {
            'total_paid': 0.0,
            'total_incurred': 0.0,
            'total_reserve': 0.0,
            'total_claims': len(claims)
        }
        
        for claim in claims:
            if claim.get('paid') is not None:
                totals['total_paid'] += claim['paid']
            if claim.get('incurred') is not None:
                totals['total_incurred'] += claim['incurred']
            if claim.get('reserve') is not None:
                totals['total_reserve'] += claim['reserve']
        
        return totals
    
    def _extract_policy_info(self, document: Document) -> Dict[str, Any]:
        """Extract policy information from document."""
        policy_info = {}
        
        if document.raw_text:
            text = document.raw_text
            
            # Extract policy number
            import re
            policy_match = re.search(
                r'policy.*(?:number|no|#)[:\s]+([A-Z0-9\-]+)',
                text,
                re.IGNORECASE
            )
            if policy_match:
                policy_info['policy_number'] = policy_match.group(1).strip()
            
            # Extract insured name
            insured_match = re.search(
                r'(?:named\s+)?insured[:\s]+([^\n]+)',
                text,
                re.IGNORECASE
            )
            if insured_match:
                policy_info['insured_name'] = insured_match.group(1).strip()
            
            # Extract policy period
            period_match = re.search(
                r'policy\s+period[:\s]+([0-9/\-]+)\s+to\s+([0-9/\-]+)',
                text,
                re.IGNORECASE
            )
            if period_match:
                policy_info['policy_period'] = {
                    'start': self._parse_date(period_match.group(1)),
                    'end': self._parse_date(period_match.group(2))
                }
        
        return policy_info
    
    def _calculate_confidence(
        self,
        claims: List[Dict[str, Any]],
        warnings: List[str]
    ) -> float:
        """Calculate extraction confidence."""
        if not claims:
            return 0.0
        
        # Base confidence
        confidence = 0.7
        
        # Bonus for multiple claims
        if len(claims) >= 3:
            confidence += 0.1
        
        # Bonus for complete data
        complete_claims = sum(
            1 for claim in claims
            if all(claim.get(field) for field in ['claim_number', 'date_of_loss', 'paid'])
        )
        completeness_ratio = complete_claims / len(claims)
        confidence += completeness_ratio * 0.15
        
        # Penalty for warnings
        confidence -= len(warnings) * 0.05
        
        return max(0.0, min(1.0, confidence))
    
    def __repr__(self) -> str:
        return "LossRunExtractor()"