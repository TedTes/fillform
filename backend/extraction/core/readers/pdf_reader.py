"""
PDF reader implementation.

Auto-registers for PDF MIME types.
"""

import os
from pypdf import PdfReader as PyPdfReader
from .base_reader import BaseReader
from ..document import Document
from ..file_loader import reader_registry


@reader_registry.register('application/pdf')
class PdfReader(BaseReader):
    """
    PDF file reader.
    
    Extracts text, metadata, and structure from PDF files.
    Auto-registered for 'application/pdf' MIME type.
    """
    
    def read(self, file_path: str, document: Document) -> None:
        """
        Read PDF file and populate document.
        
        Args:
            file_path: Path to PDF file
            document: Document object to populate
        """
        try:
            reader = PyPdfReader(file_path)
            
            # Extract metadata
            if reader.metadata:
                document.metadata['title'] = reader.metadata.get('/Title', '')
                document.metadata['author'] = reader.metadata.get('/Author', '')
                document.metadata['subject'] = reader.metadata.get('/Subject', '')
                document.metadata['creator'] = reader.metadata.get('/Creator', '')
                document.metadata['producer'] = reader.metadata.get('/Producer', '')
            
            # Extract structure info
            document.structure.page_count = len(reader.pages)
            
            # Check for fillable fields
            if reader.get_fields():
                document.structure.has_fillable_fields = True
                document.metadata['field_count'] = len(reader.get_fields())
            
            # Extract text from all pages
            text_content = []
            for page_num, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
                except Exception as e:
                    document.add_warning(f"Failed to extract text from page {page_num + 1}: {e}")
            
            document.raw_text = '\n\n'.join(text_content)
            
            # Check if PDF has text content (not scanned)
            if not document.raw_text.strip():
                document.add_warning("PDF contains no text - may be scanned document requiring OCR")
                document.metadata['requires_ocr'] = True
            else:
                document.metadata['requires_ocr'] = False
            
        except Exception as e:
            document.add_error(f"Failed to read PDF: {str(e)}")
            raise