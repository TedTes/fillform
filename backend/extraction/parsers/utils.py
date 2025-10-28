"""
Utility functions for parsers.

Common helper functions used across multiple parsers.
"""

import os
from typing import Optional, Tuple


def get_file_extension(file_path: str) -> str:
    """
    Get file extension in lowercase.
    
    Args:
        file_path: Path to file
        
    Returns:
        File extension (e.g., '.pdf', '.xlsx')
    """
    return os.path.splitext(file_path)[1].lower()


def validate_file_exists(file_path: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that file exists and is readable.
    
    Args:
        file_path: Path to file
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not file_path:
        return False, "File path is empty"
    
    if not os.path.exists(file_path):
        return False, f"File not found: {file_path}"
    
    if not os.path.isfile(file_path):
        return False, f"Path is not a file: {file_path}"
    
    if not os.access(file_path, os.R_OK):
        return False, f"File is not readable: {file_path}"
    
    return True, None


def get_file_size_mb(file_path: str) -> float:
    """
    Get file size in megabytes.
    
    Args:
        file_path: Path to file
        
    Returns:
        File size in MB
    """
    size_bytes = os.path.getsize(file_path)
    return size_bytes / (1024 * 1024)


def is_file_too_large(file_path: str, max_size_mb: float = 50.0) -> bool:
    """
    Check if file exceeds size limit.
    
    Args:
        file_path: Path to file
        max_size_mb: Maximum file size in MB (default: 50MB)
        
    Returns:
        True if file is too large
    """
    return get_file_size_mb(file_path) > max_size_mb


def clean_extracted_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace.
    
    Args:
        text: Raw extracted text
        
    Returns:
        Cleaned text
    """
    if not text:
        return ""
    
    # Remove excessive newlines
    text = '\n'.join(line.strip() for line in text.split('\n'))
    
    # Remove multiple consecutive blank lines
    lines = text.split('\n')
    cleaned_lines = []
    prev_blank = False
    
    for line in lines:
        is_blank = not line.strip()
        if is_blank and prev_blank:
            continue
        cleaned_lines.append(line)
        prev_blank = is_blank
    
    return '\n'.join(cleaned_lines).strip()


def truncate_text(text: str, max_length: int = 10000) -> str:
    """
    Truncate text to maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        
    Returns:
        Truncated text with indicator if truncated
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length] + f"\n\n... (truncated, {len(text) - max_length} more characters)"


def estimate_processing_time(file_path: str, parser_type: str) -> float:
    """
    Estimate processing time in seconds.
    
    Args:
        file_path: Path to file
        parser_type: Type of parser ('ocr', 'table', 'excel', etc.)
        
    Returns:
        Estimated time in seconds
    """
    size_mb = get_file_size_mb(file_path)
    
    # Rough estimates based on parser type
    time_per_mb = {
        'pdf_field': 0.1,
        'ocr': 5.0,  # OCR is slow
        'table': 1.0,
        'excel': 0.2,
        'image': 3.0
    }
    
    base_time = time_per_mb.get(parser_type, 1.0)
    return size_mb * base_time