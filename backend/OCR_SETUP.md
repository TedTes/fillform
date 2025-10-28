# OCR Setup Guide

## Installing Tesseract OCR

The OCR parser requires Tesseract OCR engine to be installed on your system.

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install libtesseract-dev
```

### macOS
```bash
brew install tesseract
```

### Windows
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. Add Tesseract to PATH:
   - Default location: `C:\Program Files\Tesseract-OCR`
   - Add to System Environment Variables

### Verify Installation
```bash
tesseract --version
```

## Installing Additional Languages

### English (default - included)
```bash
# Already included
```

### Spanish
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr-spa

# macOS
brew install tesseract-lang
```

### French
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr-fra
```

### Multiple Languages
```python
from extraction.parsers import OcrParser

# Initialize with multiple languages
parser = OcrParser(languages=['eng', 'spa', 'fra'])
```

## Poppler (for PDF to Image conversion)

### Ubuntu/Debian
```bash
sudo apt-get install poppler-utils
```

### macOS
```bash
brew install poppler
```

### Windows
1. Download from: http://blog.alivate.com.au/poppler-windows/
2. Extract and add `bin/` to PATH

## Troubleshooting

### "Tesseract not found" error
- Ensure Tesseract is installed
- Check PATH environment variable
- Restart terminal/IDE after installation

### Low OCR accuracy
- Increase image DPI (300+ recommended)
- Enable preprocessing: `OcrParser(preprocess=True)`
- Use appropriate language: `OcrParser(languages=['eng'])`
- Check image quality (contrast, resolution)

### Slow OCR processing
- Reduce DPI for faster processing (trade-off with accuracy)
- Process pages in parallel (future enhancement)
- Use OcrFallbackParser to avoid OCR when not needed