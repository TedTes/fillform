"""
Universal file readers.

Each reader registers itself for specific MIME types.
"""

# Readers will auto-register when imported
from .pdf_reader import PdfReader
from .excel_reader import ExcelReader
from .image_reader import ImageReader
from .text_reader import TextReader
from .docx_reader import DocxReader
from .generic_reader import GenericReader

__all__ = [
    'PdfReader',
    'ExcelReader',
    'ImageReader',
    'TextReader',
    'DocxReader',
    'GenericReader'
]