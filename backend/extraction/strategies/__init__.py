"""
Extraction strategies for advanced document processing.

Strategies orchestrate extraction across multiple documents,
handle fallbacks, and merge results intelligently.
"""

from .fusion_strategy import FusionStrategy, DocumentGroup

__all__ = [
    'FusionStrategy',
    'DocumentGroup',
]

__version__ = '1.0.0'