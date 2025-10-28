"""
Core extraction foundation.

Provides universal document handling and canonical schemas.
"""

from .document import Document, DocumentType, DocumentStatus, TableData, ImageData, StructureInfo
from .schema import SchemaRegistry
from .file_loader import UniversalFileLoader, MimeDetector, FileTypeRegistry, reader_registry

# Import readers to trigger auto-registration
from .readers import PdfReader, ExcelReader, ImageReader, TextReader, GenericReader

__all__ = [
    'Document',
    'DocumentType',
    'DocumentStatus',
    'TableData',
    'ImageData',
    'StructureInfo',
    'SchemaRegistry',
    'UniversalFileLoader',
    'MimeDetector',
    'FileTypeRegistry',
    'reader_registry',
    'PdfReader',
    'ExcelReader',
    'ImageReader',
    'TextReader',
    'GenericReader'
]