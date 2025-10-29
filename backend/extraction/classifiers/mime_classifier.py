"""
MIME-based document classifier.

Uses file MIME type and extension to provide initial classification hints.
This is a fast, lightweight classifier that runs first.
"""

from typing import List, Dict, Any, Tuple
from ..interfaces.classifier import IClassifier
from ..core.document import Document, DocumentType


class MimeClassifier(IClassifier):
    """
    MIME-based document classifier.
    
    Provides initial classification based on file type.
    Used as first-pass classifier before content analysis.
    
    Classification rules:
    - PDF files → Could be ACORD forms, Loss Runs, etc.
    - Excel files → Likely SOV or Financial Statement
    - Images → Likely supplemental documents
    - Unknown types → Generic
    
    Note: This classifier provides LOW confidence because
    MIME type alone can't determine document content.
    """
    
    # MIME type to likely document type mapping
    MIME_TYPE_HINTS = {
        'application/pdf': [
            DocumentType.ACORD_126,
            DocumentType.ACORD_125,
            DocumentType.ACORD_130,
            DocumentType.ACORD_140,
            DocumentType.LOSS_RUN,
            DocumentType.FINANCIAL_STATEMENT,
            DocumentType.GENERIC
        ],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
            DocumentType.SOV,
            DocumentType.FINANCIAL_STATEMENT,
            DocumentType.LOSS_RUN
        ],
        'application/vnd.ms-excel': [
            DocumentType.SOV,
            DocumentType.FINANCIAL_STATEMENT,
            DocumentType.LOSS_RUN
        ],
        'text/csv': [
            DocumentType.SOV,
            DocumentType.LOSS_RUN
        ],
        'image/jpeg': [
            DocumentType.SUPPLEMENTAL
        ],
        'image/png': [
            DocumentType.SUPPLEMENTAL
        ],
        'image/tiff': [
            DocumentType.SUPPLEMENTAL
        ],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
            DocumentType.SUPPLEMENTAL,
            DocumentType.GENERIC
        ]
    }
    
    # File extension hints (fallback if MIME unknown)
    EXTENSION_HINTS = {
        '.pdf': [
            DocumentType.ACORD_126,
            DocumentType.LOSS_RUN,
            DocumentType.FINANCIAL_STATEMENT,
            DocumentType.GENERIC
        ],
        '.xlsx': [DocumentType.SOV, DocumentType.FINANCIAL_STATEMENT],
        '.xls': [DocumentType.SOV, DocumentType.FINANCIAL_STATEMENT],
        '.csv': [DocumentType.SOV, DocumentType.LOSS_RUN],
        '.jpg': [DocumentType.SUPPLEMENTAL],
        '.jpeg': [DocumentType.SUPPLEMENTAL],
        '.png': [DocumentType.SUPPLEMENTAL],
        '.tiff': [DocumentType.SUPPLEMENTAL],
        '.tif': [DocumentType.SUPPLEMENTAL],
        '.docx': [DocumentType.SUPPLEMENTAL, DocumentType.GENERIC],
        '.doc': [DocumentType.SUPPLEMENTAL, DocumentType.GENERIC]
    }
    
    def __init__(self, confidence_multiplier: float = 0.3):
        """
        Initialize MIME classifier.
        
        Args:
            confidence_multiplier: Confidence multiplier for MIME-based classification
                                  (default: 0.3 = low confidence, needs content verification)
        """
        self.confidence_multiplier = confidence_multiplier
    
    def classify(self, document: Document) -> Tuple[DocumentType, float]:
        """
        Classify document based on MIME type and extension.
        
        Args:
            document: Document object with MIME type
            
        Returns:
            Tuple of (DocumentType, confidence)
            
        Note:
            Returns LOW confidence (0.2-0.4) because MIME type alone
            cannot determine document content accurately.
        """
        # Get possible document types from MIME
        possible_types = self._get_possible_types(document)
        
        if not possible_types:
            return DocumentType.UNKNOWN, 0.0
        
        # For MIME-based classification, we can't distinguish between types
        # Return the first (most common) type with low confidence
        primary_type = possible_types[0]
        
        # Calculate confidence based on specificity
        if len(possible_types) == 1:
            # Only one possibility - slightly higher confidence
            confidence = 0.4 * self.confidence_multiplier
        else:
            # Multiple possibilities - lower confidence
            confidence = 0.2 * self.confidence_multiplier
        
        return primary_type, confidence
    
    def get_indicators(self, document: Document) -> List[Dict[str, Any]]:
        """
        Get MIME-based classification indicators.
        
        Args:
            document: Document object
            
        Returns:
            List of indicators found
        """
        indicators = []
        
        # MIME type indicator
        if document.mime_type:
            indicators.append({
                'type': 'mime_type',
                'value': document.mime_type,
                'confidence': 0.3,
                'location': 'file_metadata'
            })
        
        # Extension indicator
        if document.file_extension:
            indicators.append({
                'type': 'file_extension',
                'value': document.file_extension,
                'confidence': 0.2,
                'location': 'filename'
            })
        
        # Possible document types
        possible_types = self._get_possible_types(document)
        if possible_types:
            indicators.append({
                'type': 'possible_types',
                'value': [dt.value for dt in possible_types],
                'confidence': 0.3,
                'location': 'mime_mapping'
            })
        
        return indicators
    
    def can_classify(self, document: Document) -> bool:
        """
        Check if classifier can analyze document.
        
        Args:
            document: Document object
            
        Returns:
            True if document has MIME type or extension
        """
        return bool(document.mime_type or document.file_extension)
    
    def get_supported_types(self) -> List[DocumentType]:
        """
        Get all document types this classifier can identify.
        
        Returns:
            List of all DocumentType values
        """
        all_types = set()
        
        for types in self.MIME_TYPE_HINTS.values():
            all_types.update(types)
        
        for types in self.EXTENSION_HINTS.values():
            all_types.update(types)
        
        return list(all_types)
    
    def get_priority(self) -> int:
        """
        Get classifier priority.
        
        Returns:
            10 (high priority - runs first as quick check)
        """
        return 10  # Run first
    
    def _get_possible_types(self, document: Document) -> List[DocumentType]:
        """
        Get possible document types based on MIME and extension.
        
        Args:
            document: Document object
            
        Returns:
            List of possible DocumentType values
        """
        possible_types = []
        
        # Check MIME type
        if document.mime_type and document.mime_type in self.MIME_TYPE_HINTS:
            possible_types.extend(self.MIME_TYPE_HINTS[document.mime_type])
        
        # Check extension as fallback
        if not possible_types and document.file_extension:
            ext = document.file_extension.lower()
            if ext in self.EXTENSION_HINTS:
                possible_types.extend(self.EXTENSION_HINTS[ext])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_types = []
        for dt in possible_types:
            if dt not in seen:
                seen.add(dt)
                unique_types.append(dt)
        
        return unique_types
    
    def get_likely_types_with_confidence(self, document: Document) -> List[Tuple[DocumentType, float]]:
        """
        Get all likely document types with individual confidence scores.
        
        Args:
            document: Document object
            
        Returns:
            List of (DocumentType, confidence) tuples
        """
        possible_types = self._get_possible_types(document)
        
        if not possible_types:
            return [(DocumentType.UNKNOWN, 0.0)]
        
        # Distribute confidence across possibilities
        base_confidence = 0.3 * self.confidence_multiplier
        decay_factor = 0.8  # Each subsequent type gets lower confidence
        
        results = []
        for i, doc_type in enumerate(possible_types):
            confidence = base_confidence * (decay_factor ** i)
            results.append((doc_type, confidence))
        
        return results
    
    def __repr__(self) -> str:
        """String representation."""
        return f"MimeClassifier(confidence_multiplier={self.confidence_multiplier})"