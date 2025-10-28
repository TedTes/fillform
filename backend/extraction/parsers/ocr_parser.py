"""
OCR parser for extracting text from scanned documents and images.

Uses Tesseract OCR engine via pytesseract.
Implements IParser interface.
"""

import os
from typing import Dict, Any, Optional, List
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
from ..interfaces.parser import IParser


class OcrParser(IParser):
    """
    OCR parser for scanned PDFs and images.
    
    Uses Tesseract OCR to extract text from:
    - Scanned PDF documents
    - Image files (JPG, PNG, TIFF, etc.)
    - Documents without text layers
    
    Features:
    - Multi-language support
    - Confidence scoring per page
    - Preprocessing options for better accuracy
    - Batch processing for multi-page documents
    """
    
    # Supported languages (can be configured)
    DEFAULT_LANGUAGES = ['eng']  # English by default
    
    # OCR configuration options
    DEFAULT_CONFIG = '--oem 3 --psm 3'  # LSTM OCR, Auto page segmentation
    
    def __init__(
        self,
        languages: Optional[List[str]] = None,
        config: Optional[str] = None,
        preprocess: bool = True
    ):
        """
        Initialize OCR parser.
        
        Args:
            languages: List of language codes (e.g., ['eng', 'spa'])
            config: Tesseract configuration string
            preprocess: Whether to preprocess images for better OCR
        """
        self.languages = languages or self.DEFAULT_LANGUAGES
        self.config = config or self.DEFAULT_CONFIG
        self.preprocess = preprocess
        
        # Validate Tesseract installation
        self._validate_tesseract()
    
    def _validate_tesseract(self):
        """Validate that Tesseract is installed and accessible."""
        try:
            pytesseract.get_tesseract_version()
        except Exception as e:
            raise RuntimeError(
                "Tesseract OCR not found. Please install Tesseract: "
                "https://github.com/tesseract-ocr/tesseract"
            ) from e
    
    def extract_fields(self, pdf_path: str) -> Dict[str, Any]:
        """
        Extract text from scanned document using OCR.
        
        Args:
            pdf_path: Path to PDF or image file
            
        Returns:
            Dictionary with extracted text and metadata
            {
                'text': 'Extracted text...',
                'pages': [
                    {'page_num': 1, 'text': '...', 'confidence': 85.5},
                    ...
                ],
                'confidence': 82.3,  # Average confidence
                'language': 'eng',
                'warnings': []
            }
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File not found: {pdf_path}")
        
        # Determine file type
        file_ext = os.path.splitext(pdf_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._extract_from_pdf(pdf_path)
        elif file_ext in ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif']:
            return self._extract_from_image(pdf_path)
        else:
            raise ValueError(f"Unsupported file type for OCR: {file_ext}")
    
    def _extract_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF by converting to images first."""
        try:
            # Convert PDF pages to images
            images = convert_from_path(pdf_path, dpi=300)
            
            pages_data = []
            all_text = []
            total_confidence = 0
            warnings = []
            
            for page_num, image in enumerate(images, start=1):
                # Preprocess if enabled
                if self.preprocess:
                    image = self._preprocess_image(image)
                
                # Extract text and confidence
                text = self._extract_text_from_image(image)
                confidence = self._get_confidence(image)
                
                pages_data.append({
                    'page_num': page_num,
                    'text': text,
                    'confidence': confidence
                })
                
                all_text.append(f"=== Page {page_num} ===\n{text}")
                total_confidence += confidence
                
                # Add warnings for low confidence pages
                if confidence < 60:
                    warnings.append(
                        f"Page {page_num} has low OCR confidence ({confidence:.1f}%)"
                    )
            
            avg_confidence = total_confidence / len(images) if images else 0
            
            return {
                'text': '\n\n'.join(all_text),
                'pages': pages_data,
                'confidence': round(avg_confidence, 2),
                'language': '+'.join(self.languages),
                'page_count': len(images),
                'warnings': warnings
            }
            
        except Exception as e:
            raise ValueError(f"Failed to OCR PDF: {str(e)}")
    
    def _extract_from_image(self, image_path: str) -> Dict[str, Any]:
        """Extract text from single image file."""
        try:
            # Open image
            image = Image.open(image_path)
            
            # Preprocess if enabled
            if self.preprocess:
                image = self._preprocess_image(image)
            
            # Extract text and confidence
            text = self._extract_text_from_image(image)
            confidence = self._get_confidence(image)
            
            warnings = []
            if confidence < 60:
                warnings.append(f"Low OCR confidence ({confidence:.1f}%)")
            
            return {
                'text': text,
                'pages': [{
                    'page_num': 1,
                    'text': text,
                    'confidence': confidence
                }],
                'confidence': round(confidence, 2),
                'language': '+'.join(self.languages),
                'page_count': 1,
                'warnings': warnings
            }
            
        except Exception as e:
            raise ValueError(f"Failed to OCR image: {str(e)}")
    
    def _extract_text_from_image(self, image: Image.Image) -> str:
        """
        Extract text from PIL Image using Tesseract.
        
        Args:
            image: PIL Image object
            
        Returns:
            Extracted text
        """
        lang_str = '+'.join(self.languages)
        
        try:
            text = pytesseract.image_to_string(
                image,
                lang=lang_str,
                config=self.config
            )
            return text.strip()
        except Exception as e:
            raise ValueError(f"Tesseract OCR failed: {str(e)}")
    
    def _get_confidence(self, image: Image.Image) -> float:
        """
        Get OCR confidence score for image.
        
        Args:
            image: PIL Image object
            
        Returns:
            Confidence score (0-100)
        """
        lang_str = '+'.join(self.languages)
        
        try:
            # Get detailed OCR data including confidence
            data = pytesseract.image_to_data(
                image,
                lang=lang_str,
                config=self.config,
                output_type=pytesseract.Output.DICT
            )
            
            # Calculate average confidence (excluding -1 values)
            confidences = [
                float(conf) for conf in data['conf'] 
                if conf != '-1' and conf != -1
            ]
            
            if not confidences:
                return 0.0
            
            return sum(confidences) / len(confidences)
            
        except Exception:
            # If confidence extraction fails, return default
            return 50.0
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image to improve OCR accuracy.
        
        Applies:
        - Grayscale conversion
        - Contrast enhancement
        - Noise reduction (optional)
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed image
        """
        from PIL import ImageEnhance, ImageFilter
        
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)
        
        # Optional: Apply slight blur to reduce noise
        # image = image.filter(ImageFilter.MedianFilter(size=3))
        
        return image
    
    def is_fillable(self, pdf_path: str) -> bool:
        """
        OCR parser doesn't work with fillable fields.
        
        Args:
            pdf_path: Path to PDF
            
        Returns:
            Always False (OCR is for scanned documents)
        """
        return False
    
    def supports_file(self, file_path: str) -> bool:
        """
        Check if file is supported for OCR.
        
        Args:
            file_path: Path to file
            
        Returns:
            True if file can be OCR'd
        """
        ext = os.path.splitext(file_path)[1].lower()
        supported_exts = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp', '.gif']
        return ext in supported_exts
    
    def get_supported_languages(self) -> List[str]:
        """
        Get list of available OCR languages.
        
        Returns:
            List of language codes available in Tesseract
        """
        try:
            langs = pytesseract.get_languages(config='')
            return langs
        except Exception:
            return self.DEFAULT_LANGUAGES
    
    def set_languages(self, languages: List[str]):
        """
        Set OCR languages.
        
        Args:
            languages: List of language codes (e.g., ['eng', 'spa', 'fra'])
        """
        available = self.get_supported_languages()
        
        # Validate languages
        invalid = [lang for lang in languages if lang not in available]
        if invalid:
            raise ValueError(
                f"Invalid language codes: {invalid}. "
                f"Available: {available}"
            )
        
        self.languages = languages
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"OcrParser(languages={self.languages}, "
            f"preprocess={self.preprocess})"
        )


class OcrFallbackParser(IParser):
    """
    OCR parser that serves as fallback when text extraction fails.
    
    Automatically tries OCR when:
    - PDF has no text layer
    - Text extraction returns empty/minimal content
    - Document is suspected to be scanned
    """
    
    def __init__(self, text_threshold: int = 50):
        """
        Initialize fallback parser.
        
        Args:
            text_threshold: Minimum characters needed to skip OCR
        """
        self.ocr_parser = OcrParser()
        self.text_threshold = text_threshold
    
    def extract_fields(self, pdf_path: str) -> Dict[str, Any]:
        """
        Try text extraction first, fall back to OCR if needed.
        
        Args:
            pdf_path: Path to PDF
            
        Returns:
            Extraction result with method used
        """
        from .pdf_field_parser import PdfFieldParser
        
        # Try standard text extraction first
        text_parser = PdfFieldParser()
        
        try:
            result = text_parser.extract_fields(pdf_path)
            
            # Check if sufficient text was extracted
            text_length = len(result.get('text', ''))
            
            if text_length >= self.text_threshold:
                result['method'] = 'text_extraction'
                result['ocr_used'] = False
                return result
            
            # Insufficient text, try OCR
            ocr_result = self.ocr_parser.extract_fields(pdf_path)
            ocr_result['method'] = 'ocr'
            ocr_result['ocr_used'] = True
            ocr_result['fallback_reason'] = f'Insufficient text ({text_length} chars)'
            
            return ocr_result
            
        except Exception as e:
            # Text extraction failed, use OCR
            ocr_result = self.ocr_parser.extract_fields(pdf_path)
            ocr_result['method'] = 'ocr'
            ocr_result['ocr_used'] = True
            ocr_result['fallback_reason'] = f'Text extraction failed: {str(e)}'
            
            return ocr_result
    
    def is_fillable(self, pdf_path: str) -> bool:
        """Check if PDF has fillable fields."""
        return False