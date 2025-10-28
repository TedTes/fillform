"""
Extraction module for converting PDFs to canonical JSON format.
"""

from .interfaces.extractor import IExtractor
from .interfaces.parser import IParser
from .interfaces.mapper import IMapper
from .models.extraction_result import ExtractionResult
from .extractors import Acord126Extractor
from .parsers import (
    PdfFieldParser,
    OcrParser,
    OcrFallbackParser,
    TableParser,
    ExcelParser,
    ImageParser
)

__all__ = [
    'IExtractor',
    'IParser',
    'IMapper',
    'ExtractionResult',
    'Acord126Extractor',
    'PdfFieldParser',
    'OcrParser',
    'OcrFallbackParser',
    'TableParser',
    'ExcelParser',
    'ImageParser'
]