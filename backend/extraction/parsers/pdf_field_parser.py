"""
PDF field parser implementation using pypdf.
"""

import os
from typing import Dict, Any, Optional
from pypdf import PdfReader
from ..interfaces.parser import IParser


class PdfFieldParser(IParser):
    """
    Parser for extracting form fields from fillable PDFs.
    
    Uses pypdf to read PDF form field names and values.
    Returns raw field data without any transformation.
    """
    
    def extract_fields(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract raw field names and values from PDF.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Dictionary of PDF field names to values
            Example: {
                "NamedInsured_FullName_A": "ABC Corp",
                "GeneralLiability_EachOccurrence_LimitAmount_A": "1000000",
                "GeneralLiability_OccurrenceIndicator_A": "/Yes"
            }
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
            ValueError: If PDF is not readable or has no fields
        """
        # Validate file exists
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        try:
            # Open PDF
            reader = PdfReader(pdf_path)
            
            # Get form fields
            fields = reader.get_fields()
            
            if not fields:
                raise ValueError(f"PDF has no form fields: {pdf_path}")
            
            # Extract field values
            result = {}
            for field_name, field_obj in fields.items():
                value = self._extract_field_value(field_obj)
                if value is not None:
                    result[field_name] = value
            
            return result
            
        except Exception as e:
            if isinstance(e, (FileNotFoundError, ValueError)):
                raise
            raise ValueError(f"Error reading PDF: {str(e)}")
    
    def is_fillable(self, pdf_path: str) -> bool:
        """
        Check if PDF has fillable form fields.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            True if PDF has form fields, False otherwise
        """
        if not os.path.exists(pdf_path):
            return False
        
        try:
            reader = PdfReader(pdf_path)
            fields = reader.get_fields()
            return fields is not None and len(fields) > 0
        except Exception:
            return False
    
    def _extract_field_value(self, field_obj: Any) -> Optional[Any]:
        """
        Extract value from field object.
        
        Handles different field types:
        - Text fields: return string value
        - Checkboxes: return checkbox state
        - Buttons: return button value
        
        Args:
            field_obj: pypdf field object
            
        Returns:
            Field value or None if no value
        """
        if field_obj is None:
            return None
        
        # Get field value
        value = field_obj.get('/V')
        
        if value is None:
            return None
        
        # Handle different value types
        if hasattr(value, 'get_object'):
            # Name object (e.g., checkbox)
            value = value.get_object()
        
        # Convert to string if it's a name
        if isinstance(value, str):
            return value
        elif hasattr(value, '__str__'):
            return str(value)
        
        return value