"""
Image reader implementation.

Auto-registers for image MIME types.
"""

from PIL import Image
from .base_reader import BaseReader
from ..document import Document, ImageData
from ..file_loader import reader_registry


@reader_registry.register(
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/gif'
)
class ImageReader(BaseReader):
    """
    Image file reader.
    
    Extracts image metadata and prepares for OCR.
    Auto-registered for common image MIME types.
    """
    
    def read(self, file_path: str, document: Document) -> None:
        """
        Read image file and populate document.
        
        Args:
            file_path: Path to image file
            document: Document object to populate
        """
        try:
            with Image.open(file_path) as img:
                # Read image data
                with open(file_path, 'rb') as f:
                    image_data = f.read()
                
                # Create ImageData object
                image_obj = ImageData(
                    data=image_data,
                    format=img.format.lower(),
                    width=img.width,
                    height=img.height,
                    metadata={
                        'mode': img.mode,
                        'size': img.size
                    }
                )
                
                document.add_image(image_obj)
                
                # Store metadata
                document.metadata['image_format'] = img.format
                document.metadata['image_size'] = img.size
                document.metadata['image_mode'] = img.mode
                document.structure.page_count = 1
                
                # Mark that OCR is needed
                document.add_warning("Image file requires OCR for text extraction")
                document.metadata['requires_ocr'] = True
                
        except Exception as e:
            document.add_error(f"Failed to read image: {str(e)}")
            raise