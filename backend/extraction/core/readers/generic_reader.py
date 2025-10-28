"""
Generic fallback reader.

Handles unknown or unsupported file types.
"""

import os
from .base_reader import BaseReader
from ..document import Document
from ..file_loader import reader_registry


@reader_registry.register('generic')
class GenericReader(BaseReader):
    """
    Generic fallback reader.
    
    Used when no specific reader is available.
    Extracts basic file metadata only.
    """
    
    def read(self, file_path: str, document: Document) -> None:
        """
        Read file metadata only.
        
        Args:
            file_path: Path to file
            document: Document object to populate
        """
        try:
            # Get file stats
            stats = os.stat(file_path)
            
            document.metadata['file_size'] = stats.st_size
            document.metadata['created'] = stats.st_ctime
            document.metadata['modified'] = stats.st_mtime
            
            # Try to read as text (fallback)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(10000)  # Read first 10KB
                    document.raw_text = content
                    document.add_warning("Generic reader: read as text, may be incomplete")
            except:
                document.add_warning("Generic reader: could not read as text")
            
            document.structure.page_count = 1
            
        except Exception as e:
            document.add_error(f"Generic reader failed: {str(e)}")
            raise