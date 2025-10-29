"""
Interfaces for extraction components.
"""

from .extractor import IExtractor
from .parser import IParser
from .mapper import IMapper
from .classifier import IClassifier, ClassificationResult, CompositeClassifier

__all__ = [
    'IExtractor',
    'IParser',
    'IMapper',
    'IClassifier',
    'ClassificationResult',
    'CompositeClassifier'
]