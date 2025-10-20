"""
Interface for field mappers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class IMapper(ABC):
    """
    Interface for mapping raw PDF fields to canonical JSON structure.
    
    Implementations should transform raw PDF field data into
    standardized JSON format (e.g., ACORD_126_sample.json structure).
    """
    
    @abstractmethod
    def map_to_canonical(self, raw_fields: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform raw PDF fields to canonical JSON structure.
        
        Args:
            raw_fields: Raw PDF field names and values
                       Example: {"NamedInsured_FullName_A": "ABC Corp"}
            
        Returns:
            Canonical JSON structure
            Example: {"applicant": {"business_name": "ABC Corp"}}
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