"""
Document extractors for orchestrating extraction workflows.
"""

from .acord_126_extractor import Acord126Extractor
from .loss_run_extractor import LossRunExtractor
from .sov_extractor import SovExtractor
from .financial_statement_extractor import FinancialStatementExtractor
from .generic_extractor import GenericExtractor
from .supplemental_extractor import SupplementalExtractor
from .registry import ExtractorRegistry, extractor_registry
from .factory import ExtractorFactory, extract_from_document
__all__ = [

    # Extractors
    'Acord126Extractor',
    'LossRunExtractor',
    'SovExtractor',
    'FinancialStatementExtractor',
    'GenericExtractor',
    'SupplementalExtractor',

    # Registry & Factory
    'ExtractorRegistry', 
    'extractor_registry',
    'ExtractorFactory',
    'extract_from_document'
    ]