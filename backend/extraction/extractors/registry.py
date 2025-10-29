"""
Extractor registry for managing and selecting extractors.

Provides centralized access to extractors and automatic selection
based on document type.
"""

from typing import Dict, Type, Optional, List
from ..interfaces.extractor import IExtractor
from ..core.document import Document, DocumentType


class ExtractorRegistry:
    """
    Registry for document extractors.
    
    Maps document types to appropriate extractors and provides
    factory methods for creating extractor instances.
    """
    
    def __init__(self):
        """Initialize extractor registry."""
        self._extractors: Dict[DocumentType, Type[IExtractor]] = {}
        self._register_default_extractors()
    
    def _register_default_extractors(self):
        """Register default extractors."""
        try:
            from .acord_126_extractor import Acord126Extractor
            self.register(DocumentType.ACORD_126, Acord126Extractor)
        except ImportError:
            pass
        
        try:
            from .loss_run_extractor import LossRunExtractor
            self.register(DocumentType.LOSS_RUN, LossRunExtractor)
        except ImportError:
            pass
        
        try:
            from .sov_extractor import SovExtractor
            self.register(DocumentType.SOV, SovExtractor)
        except ImportError:
            pass
        
        try:
            from .financial_statement_extractor import FinancialStatementExtractor
            self.register(DocumentType.FINANCIAL_STATEMENT, FinancialStatementExtractor)
        except ImportError:
            pass
        
        try:
            from .supplemental_extractor import SupplementalExtractor
            self.register(DocumentType.SUPPLEMENTAL, SupplementalExtractor)
        except ImportError:
            pass
        
        try:
            from .generic_extractor import GenericExtractor
            self.register(DocumentType.GENERIC, GenericExtractor)
            self.register(DocumentType.UNKNOWN, GenericExtractor)
        except ImportError:
            pass

        try:
            from .acord_125_extractor import Acord125Extractor
            self.register(DocumentType.ACORD_125, Acord125Extractor)
        except ImportError:
            pass
    
        try:
            from .acord_130_extractor import Acord130Extractor
            self.register(DocumentType.ACORD_130, Acord130Extractor)
        except ImportError:
            pass
    
        try:
            from .acord_140_extractor import Acord140Extractor
            self.register(DocumentType.ACORD_140, Acord140Extractor)
        except ImportError:
            pass
    
    def register(self, document_type: DocumentType, extractor_class: Type[IExtractor]):
        """
        Register an extractor for a document type.
        
        Args:
            document_type: Document type
            extractor_class: Extractor class
        """
        self._extractors[document_type] = extractor_class
    
    def get(self, document_type: DocumentType) -> Optional[Type[IExtractor]]:
        """
        Get extractor class for document type.
        
        Args:
            document_type: Document type
            
        Returns:
            Extractor class or None if not found
        """
        return self._extractors.get(document_type)
    
    def get_extractor(self, document_type: DocumentType) -> Optional[IExtractor]:
        """
        Get extractor instance for document type.
        
        Args:
            document_type: Document type
            
        Returns:
            Extractor instance or None if not found
        """
        extractor_class = self.get(document_type)
        if extractor_class:
            return extractor_class()
        return None
    
    def get_extractor_for_document(self, document: Document) -> Optional[IExtractor]:
        """
        Get appropriate extractor for a document.
        
        Args:
            document: Document object
            
        Returns:
            Extractor instance or Generic extractor as fallback
        """
        # Try to get specific extractor
        extractor = self.get_extractor(document.document_type)
        
        if extractor and extractor.can_extract(document):
            return extractor
        
        # Fallback to generic extractor
        from .generic_extractor import GenericExtractor
        return GenericExtractor()
    
    def has_extractor(self, document_type: DocumentType) -> bool:
        """
        Check if extractor is registered for document type.
        
        Args:
            document_type: Document type
            
        Returns:
            True if extractor is available
        """
        return document_type in self._extractors
    
    def list_extractors(self) -> List[DocumentType]:
        """
        Get list of document types with registered extractors.
        
        Returns:
            List of DocumentType values
        """
        return list(self._extractors.keys())
    
    def get_extractor_info(self) -> Dict[str, Dict[str, any]]:
        """
        Get information about all registered extractors.
        
        Returns:
            Dictionary with extractor information
        """
        info = {}
        
        for doc_type, extractor_class in self._extractors.items():
            info[doc_type.value] = {
                'document_type': doc_type.value,
                'extractor_class': extractor_class.__name__,
                'supported_types': [t.value for t in extractor_class().get_supported_types()],
            }
        
        return info
    
    def __repr__(self) -> str:
        """String representation."""
        return f"ExtractorRegistry(extractors={len(self._extractors)})"


# Global extractor registry instance
extractor_registry = ExtractorRegistry()