"""
Core extraction foundation.

Provides universal document handling and canonical schemas.
"""

from .document import Document, DocumentType, DocumentStatus, TableData, ImageData, StructureInfo
from .schema import SchemaRegistry

__all__ = [
    'Document',
    'DocumentType',
    'DocumentStatus',
    'TableData',
    'ImageData',
    'StructureInfo',
    'SchemaRegistry'
]