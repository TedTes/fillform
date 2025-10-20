"""
Data model for extraction results.
"""

from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional


@dataclass
class ExtractionResult:
    """
    Result of PDF extraction process.
    
    Contains the extracted JSON data along with metadata about
    the extraction quality and any issues encountered.
    """
    
    json: Dict[str, Any]
    """Extracted data in canonical JSON format"""
    
    confidence: float = 0.0
    """Overall confidence score (0.0 to 1.0)"""
    
    warnings: List[str] = field(default_factory=list)
    """List of warning messages (non-fatal issues)"""
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    """Additional metadata about the extraction"""
    
    error: Optional[str] = None
    """Error message if extraction failed"""
    
    def is_successful(self) -> bool:
        """Check if extraction was successful."""
        return self.error is None and len(self.json) > 0
    
    def has_warnings(self) -> bool:
        """Check if there are any warnings."""
        return len(self.warnings) > 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'json': self.json,
            'confidence': self.confidence,
            'warnings': self.warnings,
            'metadata': self.metadata,
            'error': self.error
        }