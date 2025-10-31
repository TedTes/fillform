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
    
    
    field_confidence: Dict[str, float] = field(default_factory=dict)
    """Confidence scores for individual fields (0.0 to 1.0)"""
    
    def is_successful(self) -> bool:
        """Check if extraction was successful."""
        return self.error is None and len(self.json) > 0
    
    def has_warnings(self) -> bool:
        """Check if there are any warnings."""
        return len(self.warnings) > 0
    
    def get_low_confidence_fields(self, threshold: float = 0.7) -> List[tuple]:
        """
        Get fields below confidence threshold.
        
        Args:
            threshold: Minimum confidence (0.0 to 1.0)
            
        Returns:
            List of (field_path, confidence) tuples
        """
        return [
            (field_path, conf)
            for field_path, conf in self.field_confidence.items()
            if conf < threshold
        ]
    
    def get_field_confidence(self, field_path: str) -> Optional[float]:
        """Get confidence for a specific field."""
        return self.field_confidence.get(field_path)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'json': self.json,
            'confidence': self.confidence,
            'warnings': self.warnings,
            'metadata': self.metadata,
            'error': self.error,
            'field_confidence': self.field_confidence,  # ADDED
        }