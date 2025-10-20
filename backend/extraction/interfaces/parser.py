"""
Interface for PDF parsers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any


class IParser(ABC):
    """
    Interface for parsing PDFs and extracting raw field data.
    
    Implementations should handle low-level PDF reading and return
    raw field names and values without transformation.
    """
    
    @abstractmethod
    def extract_fields(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract raw field names and values from PDF.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary of PDF field names to values
            Example: {"NamedInsured_FullName_A": "ABC Corp", ...}
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
            ValueError: If PDF is not readable or has no fields
        """
        pass
    
    @abstractmethod
    def is_fillable(self, pdf_path: str) -> bool:
        """
        Check if PDF has fillable form fields.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            True if PDF has form fields, False otherwise
        """
        pass