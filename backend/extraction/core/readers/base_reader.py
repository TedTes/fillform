"""
Base reader interface.

All readers must implement this interface.
"""

from abc import ABC, abstractmethod
from ..document import Document


class BaseReader(ABC):
    """
    Base interface for file readers.
    
    All readers must implement the read() method.
    """
    
    @abstractmethod
    def read(self, file_path: str, document: Document) -> None:
        """
        Read file and populate document object.
        
        Args:
            file_path: Path to file
            document: Document object to populate
            
        Note:
            This method should modify the document object in-place,
            extracting content and updating its properties.
        """
        pass
    
    def can_read(self, file_path: str) -> bool:
        """
        Check if this reader can handle the file.
        
        Args:
            file_path: Path to file
            
        Returns:
            True if reader can handle file
        """
        return True