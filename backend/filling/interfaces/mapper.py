"""
Interface for field mappers.
"""

from abc import ABC, abstractmethod
from typing import Dict


class IMapper(ABC):
    """
    Interface for mapping canonical JSON keys to PDF field names.
    
    Implementations provide the mapping layer between standardized
    JSON structure and PDF-specific field names.
    """
    
    @abstractmethod
    def get_pdf_field_name(self, json_key: str) -> str:
        """
        Get PDF field name for a canonical JSON key.
        
        Args:
            json_key: Canonical JSON key (e.g., "applicant.business_name")
            
        Returns:
            PDF field name (e.g., "NamedInsured_FullName_A")
            
        Raises:
            KeyError: If json_key is not mapped
        """
        pass
    
    @abstractmethod
    def get_all_mappings(self) -> Dict[str, str]:
        """
        Get complete mapping dictionary.
        
        Returns:
            Dictionary of json_key -> pdf_field_name mappings
        """
        pass
    
    @abstractmethod
    def get_supported_form_type(self) -> str:
        """
        Return the form type this mapper supports.
        
        Returns:
            Form type identifier (e.g., "126", "125", "140")
        """
        pass