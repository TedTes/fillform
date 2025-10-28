"""
Image parser for extracting text and metadata from images.

Supports:
- Image files (.jpg, .jpeg, .png, .tiff, .tif, .bmp, .gif, .webp)
- OCR text extraction
- EXIF metadata extraction
- Image quality analysis

Implements IParser interface.
"""

import os
from typing import Dict, Any, List, Optional
from PIL import Image
from PIL.ExifTags import TAGS
from ..interfaces.parser import IParser


class ImageParser(IParser):
    """
    Image parser for extracting text and metadata from images.
    
    Features:
    - EXIF metadata extraction
    - Image quality analysis
    - OCR text extraction
    - Orientation detection
    - Resolution validation
    """
    
    # Minimum resolution for good OCR (megapixels)
    MIN_RESOLUTION_MP = 0.3
    
    # Maximum resolution warning (megapixels)
    MAX_RESOLUTION_MP = 20.0
    
    # Supported image formats
    SUPPORTED_FORMATS = {
        '.jpg', '.jpeg', '.png', '.tiff', '.tif', 
        '.bmp', '.gif', '.webp'
    }
    
    def __init__(
        self,
        extract_text: bool = True,
        extract_exif: bool = True,
        quality_check: bool = True
    ):
        """
        Initialize image parser.
        
        Args:
            extract_text: Whether to extract text using OCR
            extract_exif: Whether to extract EXIF metadata
            quality_check: Whether to perform quality checks
        """
        self.extract_text = extract_text
        self.extract_exif = extract_exif
        self.quality_check = quality_check
        
        # Lazy load OCR parser
        self._ocr_parser = None
    
    def extract_fields(self, image_path: str) -> Dict[str, Any]:
        """
        Extract data from image file.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with extracted data and metadata
            {
                'text': 'Extracted text...',
                'image_metadata': {
                    'width': 1920,
                    'height': 1080,
                    'format': 'JPEG',
                    'mode': 'RGB',
                    'dpi': (300, 300),
                    'megapixels': 2.07,
                    'file_size': 1234567
                },
                'exif_data': {
                    'Make': 'Canon',
                    'Model': 'EOS 5D',
                    'DateTime': '2024:10:28 12:00:00',
                    ...
                },
                'quality': {
                    'resolution_adequate': True,
                    'dpi_adequate': True,
                    'orientation': 'landscape'
                },
                'warnings': []
            }
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Validate file extension
        ext = os.path.splitext(image_path)[1].lower()
        if ext not in self.SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported image format: {ext}")
        
        result = {
            'text': '',
            'image_metadata': {},
            'exif_data': {},
            'quality': {},
            'warnings': []
        }
        
        try:
            # Open image
            with Image.open(image_path) as img:
                # Extract basic metadata
                result['image_metadata'] = self._extract_metadata(img, image_path)
                
                # Extract EXIF data
                if self.extract_exif:
                    result['exif_data'] = self._extract_exif(img)
                
                # Perform quality checks
                if self.quality_check:
                    quality, warnings = self._check_quality(img)
                    result['quality'] = quality
                    result['warnings'].extend(warnings)
                
                # Extract text using OCR
                if self.extract_text:
                    text, ocr_warnings = self._extract_text_ocr(image_path)
                    result['text'] = text
                    result['warnings'].extend(ocr_warnings)
            
            return result
            
        except Exception as e:
            raise ValueError(f"Failed to parse image: {str(e)}")
    
    def _extract_metadata(self, img: Image.Image, image_path: str) -> Dict[str, Any]:
        """Extract basic image metadata."""
        metadata = {
            'width': img.width,
            'height': img.height,
            'format': img.format or 'unknown',
            'mode': img.mode,
            'size': img.size,
            'file_size': os.path.getsize(image_path)
        }
        
        # Calculate megapixels
        megapixels = (img.width * img.height) / 1_000_000
        metadata['megapixels'] = round(megapixels, 2)
        
        # Get DPI if available
        dpi = img.info.get('dpi')
        if dpi:
            metadata['dpi'] = dpi
        else:
            metadata['dpi'] = None
        
        # Get image info
        for key, value in img.info.items():
            if key not in ['dpi', 'exif']:
                metadata[key] = str(value)
        
        return metadata
    
    def _extract_exif(self, img: Image.Image) -> Dict[str, Any]:
        """Extract EXIF metadata from image."""
        exif_data = {}
        
        try:
            # Get raw EXIF data
            exif = img._getexif()
            
            if exif:
                for tag_id, value in exif.items():
                    # Convert tag ID to readable name
                    tag_name = TAGS.get(tag_id, tag_id)
                    
                    # Convert value to string (handle bytes)
                    if isinstance(value, bytes):
                        try:
                            value = value.decode('utf-8', errors='ignore')
                        except:
                            value = str(value)
                    else:
                        value = str(value)
                    
                    exif_data[tag_name] = value
        
        except AttributeError:
            # Image format doesn't support EXIF
            pass
        except Exception as e:
            exif_data['error'] = f"Failed to extract EXIF: {str(e)}"
        
        return exif_data
    
    def _check_quality(self, img: Image.Image) -> tuple[Dict[str, Any], List[str]]:
        """Check image quality for OCR suitability."""
        quality = {}
        warnings = []
        
        # Calculate megapixels
        megapixels = (img.width * img.height) / 1_000_000
        
        # Check resolution
        if megapixels < self.MIN_RESOLUTION_MP:
            quality['resolution_adequate'] = False
            warnings.append(
                f"Low resolution ({megapixels:.2f}MP) may result in poor OCR accuracy. "
                f"Minimum recommended: {self.MIN_RESOLUTION_MP}MP"
            )
        elif megapixels > self.MAX_RESOLUTION_MP:
            quality['resolution_adequate'] = True
            warnings.append(
                f"Very high resolution ({megapixels:.2f}MP) may cause slow OCR processing. "
                f"Consider resizing for faster results."
            )
        else:
            quality['resolution_adequate'] = True
        
        # Check DPI
        dpi = img.info.get('dpi')
        if dpi:
            avg_dpi = sum(dpi) / len(dpi) if isinstance(dpi, (list, tuple)) else dpi
            if avg_dpi < 150:
                quality['dpi_adequate'] = False
                warnings.append(
                    f"Low DPI ({avg_dpi}) may result in poor OCR accuracy. "
                    f"Minimum recommended: 150 DPI"
                )
            else:
                quality['dpi_adequate'] = True
        else:
            quality['dpi_adequate'] = None
            quality['dpi_unknown'] = True
        
        # Determine orientation
        if img.width > img.height:
            quality['orientation'] = 'landscape'
        elif img.height > img.width:
            quality['orientation'] = 'portrait'
        else:
            quality['orientation'] = 'square'
        
        # Check aspect ratio
        aspect_ratio = img.width / img.height if img.height > 0 else 0
        quality['aspect_ratio'] = round(aspect_ratio, 2)
        
        # Check if image is too narrow/wide (unusual aspect ratios)
        if aspect_ratio > 3 or (aspect_ratio < 0.33 and aspect_ratio > 0):
            warnings.append(
                f"Unusual aspect ratio ({aspect_ratio:.2f}) - "
                f"image may be cropped or distorted"
            )
        
        # Check color mode
        if img.mode not in ['RGB', 'L', 'RGBA']:
            quality['color_mode_warning'] = True
            warnings.append(
                f"Image color mode '{img.mode}' is unusual. "
                f"May need conversion for optimal OCR."
            )
        else:
            quality['color_mode_warning'] = False
        
        return quality, warnings
    
    def _extract_text_ocr(self, image_path: str) -> tuple[str, List[str]]:
        """Extract text from image using OCR."""
        warnings = []
        
        # Lazy load OCR parser
        if self._ocr_parser is None:
            try:
                from .ocr_parser import OcrParser
                self._ocr_parser = OcrParser()
            except ImportError as e:
                warnings.append(
                    f"OCR not available: {str(e)}. "
                    f"Install pytesseract for text extraction."
                )
                return '', warnings
        
        try:
            # Use OCR parser
            ocr_result = self._ocr_parser.extract_fields(image_path)
            
            text = ocr_result.get('text', '')
            warnings.extend(ocr_result.get('warnings', []))
            
            # Add confidence info
            confidence = ocr_result.get('confidence', 0)
            if confidence < 70:
                warnings.append(
                    f"OCR confidence is low ({confidence:.1f}%). "
                    f"Results may be inaccurate."
                )
            
            return text, warnings
            
        except Exception as e:
            warnings.append(f"OCR extraction failed: {str(e)}")
            return '', warnings
    
    def is_fillable(self, image_path: str) -> bool:
        """
        Images don't have fillable fields.
        
        Args:
            image_path: Path to image
            
        Returns:
            Always False
        """
        return False
    
    def get_image_info(self, image_path: str) -> Dict[str, Any]:
        """
        Get basic image information without full parsing.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with basic image info
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        with Image.open(image_path) as img:
            megapixels = (img.width * img.height) / 1_000_000
            
            return {
                'width': img.width,
                'height': img.height,
                'format': img.format or 'unknown',
                'mode': img.mode,
                'megapixels': round(megapixels, 2),
                'file_size': os.path.getsize(image_path)
            }
    
    def resize_for_ocr(
        self,
        image_path: str,
        output_path: str,
        target_dpi: int = 300
    ) -> str:
        """
        Resize image to optimal resolution for OCR.
        
        Args:
            image_path: Path to input image
            output_path: Path to save resized image
            target_dpi: Target DPI for OCR (default: 300)
            
        Returns:
            Path to resized image
        """
        with Image.open(image_path) as img:
            # Calculate target dimensions based on DPI
            current_dpi = img.info.get('dpi', (72, 72))
            if isinstance(current_dpi, (list, tuple)):
                current_dpi = current_dpi[0]
            
            scale_factor = target_dpi / current_dpi
            
            new_width = int(img.width * scale_factor)
            new_height = int(img.height * scale_factor)
            
            # Resize image
            resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save with target DPI
            resized.save(output_path, dpi=(target_dpi, target_dpi))
            
            return output_path
    
    def convert_to_grayscale(
        self,
        image_path: str,
        output_path: str
    ) -> str:
        """
        Convert image to grayscale for better OCR.
        
        Args:
            image_path: Path to input image
            output_path: Path to save grayscale image
            
        Returns:
            Path to grayscale image
        """
        with Image.open(image_path) as img:
            # Convert to grayscale
            grayscale = img.convert('L')
            
            # Enhance contrast
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(grayscale)
            enhanced = enhancer.enhance(1.5)
            
            # Save
            enhanced.save(output_path)
            
            return output_path
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"ImageParser(extract_text={self.extract_text}, "
            f"extract_exif={self.extract_exif})"
        )