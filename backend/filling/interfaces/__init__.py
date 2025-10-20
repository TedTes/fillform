"""
Interfaces for filling components.
"""

from .filler import IFiller
from .mapper import IMapper
from .writer import IPdfWriter

__all__ = [
    'IFiller',
    'IMapper',
    'IPdfWriter'
]