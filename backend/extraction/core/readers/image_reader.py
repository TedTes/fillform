"""
Image reader implementation with enhanced extraction.

Auto-registers for image MIME types.
"""

from PIL import Image
import os
from .base_reader import BaseReader
from ..document import Document, ImageData
from ..file_loader import reader_registry


@reader_registry.register(
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/gif',
    'image/bmp',
    'image/webp'
)
class ImageReader(BaseReader):
    """
    Enhanced image file reader.
    
    Extracts image metadata, EXIF data, and prepares for OCR.
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
                
                # Extract EXIF data if available
                exif_data = {}
                try:
                    exif = img._getexif()
                    if exif:
                        for tag_id, value in exif.items():
                            # Convert tag ID to readable name
                            tag_name = Image.ExifTags.TAGS.get(tag_id, tag_id)
                            exif_data[tag_name] = str(value)
                except:
                    pass  # EXIF not available for all image formats
                
                # Create ImageData object
                image_obj = ImageData(
                    data=image_data,
                    format=img.format.lower() if img.format else 'unknown',
                    width=img.width,
                    height=img.height,
                    metadata={
                        'mode': img.mode,
                        'size': img.size,
                        'dpi': img.info.get('dpi', None),
                        'exif': exif_data
                    }
                )
                
                document.add_image(image_obj)
                
                # Store comprehensive metadata
                document.metadata['image_format'] = img.format or 'unknown'
                document.metadata['image_size'] = img.size
                document.metadata['image_width'] = img.width
                document.metadata['image_height'] = img.height
                document.metadata['image_mode'] = img.mode
                document.metadata['image_dpi'] = img.info.get('dpi', None)
                document.metadata['file_size'] = os.path.getsize(file_path)
                
                # Calculate megapixels
                megapixels = (img.width * img.height) / 1_000_000
                document.metadata['megapixels'] = round(megapixels, 2)
                
                # Determine if image quality is suitable for OCR
                if megapixels < 0.3:  # Less than 0.3 MP
                    document.add_warning("Image resolution may be too low for accurate OCR")
                elif megapixels > 20:  # Greater than 20 MP
                    document.add_warning("Image resolution very high - OCR may be slow")
                
                document.structure.page_count = 1
                
                # Mark that OCR is needed
                document.add_warning("Image file requires OCR for text extraction")
                document.metadata['requires_ocr'] = True
                
        except Exception as e:
            document.add_error(f"Failed to read image: {str(e)}")
            raise