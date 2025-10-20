"""
Interface for PDF writers.
"""

from abc import ABC, abstractmethod
from typing import Any
from pypdf import PdfWriter, PdfReader


class IPdfWriter(ABC):
    """
    Interface for low-level PDF field writing operations.
    
    Implementations handle the actual PDF manipulation using pypdf.
    """
    
    @abstractmethod
    def write_field(self, writer: PdfWriter, field_name: str, value: Any) -> bool:
        """
        Write value to PDF field.
        
        Args:
            writer: PdfWriter instance
            field_name: PDF field name
            value: Value to write
            
        Returns:
            True if write was successful, False otherwise
        """
        pass
    
    @abstractmethod
    def setup_acro_form(self, reader: PdfReader, writer: PdfWriter) -> None:
        """
        Set up AcroForm in writer from reader.
        
        Copies form structure and ensures fields are accessible.
        
        Args:
            reader: Source PdfReader
            writer: Target PdfWriter
        """
        pass
    
    @abstractmethod
    def set_need_appearances(self, writer: PdfWriter) -> None:
        """
        Set NeedAppearances flag for PDF viewer compatibility.
        
        Args:
            writer: PdfWriter instance
        """
        pass
    
    @abstractmethod
    def flatten_pdf(self, writer: PdfWriter) -> bool:
        """
        Flatten PDF form fields.
        
        Args:
            writer: PdfWriter instance
            
        Returns:
            True if flattening succeeded, False otherwise
        """
        pass