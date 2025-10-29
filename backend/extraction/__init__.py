"""
Extraction module for converting PDFs to canonical JSON format.

This module provides a complete extraction pipeline:
- Core: Document model, schema registry, file loading
- Parsers: PDF, OCR, Table, Excel, Image parsers
- Classifiers: Document type detection
- Extractors: ACORD form extractors
- Mappers: Field mapping to canonical JSON
- Interfaces: Standard interfaces for all components
"""

from .interfaces.extractor import IExtractor
from .interfaces.parser import IParser
from .interfaces.mapper import IMapper
from .interfaces.classifier import IClassifier, ClassificationResult, CompositeClassifier
from .models.extraction_result import ExtractionResult
from .extractors import Acord126Extractor
from .parsers import (
    PdfFieldParser,
    OcrParser,
    OcrFallbackParser,
    TableParser,
    ExcelParser,
    ImageParser,
    parser_registry,
    get_parser_for_file,
    list_available_parsers,
    get_supported_extensions
)
from .classifiers import (
    MimeClassifier,
    classifier_registry,
    KeywordClassifier
)

__all__ = [
    # Interfaces
    'IExtractor',
    'IParser',
    'IMapper',
    'IClassifier',
    
    # Models
    'ExtractionResult',
    'ClassificationResult',
    'CompositeClassifier',
    
    # Extractors
    'Acord126Extractor',
    
    # Parsers
    'PdfFieldParser',
    'OcrParser',
    'OcrFallbackParser',
    'TableParser',
    'ExcelParser',
    'ImageParser',
    
    # Parser utilities
    'parser_registry',
    'get_parser_for_file',
    'list_available_parsers',
    'get_supported_extensions',
    
    # Classifiers
    'MimeClassifier',
    'classifier_registry',
    'KeywordClassifier'
]

# Version
__version__ = '1.0.0'