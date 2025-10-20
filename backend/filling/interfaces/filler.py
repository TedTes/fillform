"""
Interface for PDF fillers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class IFiller(ABC):
    """
    Interface for filling PDF forms with data.
    
    Implementations orchestrate the filling workflow:
    mapping data, formatting values, writing to PDF.
    """
    
    @abstractmethod
    def fill(self, template_path: str, data: Dict[str, Any], output_path: str) -> Dict[str, Any]:
        """
        Fill PDF template with data.
        
        Args:
            template_path: Path to blank PDF template
            data: Canonical JSON data to fill
            output_path: Path where filled PDF should be saved
            
        Returns:
            Fill report dictionary containing:
            - written: int (number of fields written)
            - skipped: list (fields that couldn't be filled)
            - unknown_pdf_fields: list (PDF fields not in template)
            - notes: list (additional information)
            
        Raises:
            FileNotFoundError: If template doesn't exist
            ValueError: If data validation fails
        """
        pass
    
    @abstractmethod
    def get_supported_form_type(self) -> str:
        """
        Return the form type this filler supports.
        
        Returns:
            Form type identifier (e.g., "126", "125", "140")
        """
        pass