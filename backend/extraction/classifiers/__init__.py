"""
Document classifiers for content-based type detection.

Classifiers analyze document content to determine type:
- MimeClassifier: Fast initial classification based on file type
- KeywordClassifier: Searches for document type indicators (next commit)
- TableClassifier: Analyzes table structure (next commit)
- MLClassifier: Uses machine learning (future)
"""

from .mime_classifier import MimeClassifier
from .registry import ClassifierRegistry, classifier_registry
from .keyword_classifier import KeywordClassifier
__all__ = [
    'MimeClassifier',
    'KeywordClassifier',
    'ClassifierRegistry',
    'classifier_registry'
]

__version__ = '1.0.0'