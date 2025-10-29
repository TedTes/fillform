"""
File utility functions for validation and processing.
"""

import os
from typing import List

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    '.pdf',
    '.xlsx', '.xls', '.xlsm', '.csv', '.tsv',
    '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.gif', '.bmp', '.webp',
    '.docx', '.doc',
    '.txt'
}

# Maximum file size (50MB)
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def allowed_file(filename: str) -> bool:
    """
    Check if file extension is allowed.
    
    Args:
        filename: Name of file to check
    
    Returns:
        True if file extension is allowed
    """
    if not filename:
        return False
    
    ext = get_file_extension(filename)
    return ext.lower() in ALLOWED_EXTENSIONS


def get_file_extension(filename: str) -> str:
    """
    Get file extension from filename.
    
    Args:
        filename: Name of file
    
    Returns:
        File extension including dot (e.g., '.pdf')
    """
    if not filename:
        return ''
    
    return os.path.splitext(filename)[1].lower()


def validate_file_size(file_path: str) -> tuple[bool, str]:
    """
    Validate file size is within limits.
    
    Args:
        file_path: Path to file
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not os.path.exists(file_path):
        return False, 'File does not exist'
    
    file_size = os.path.getsize(file_path)
    
    if file_size > MAX_FILE_SIZE_BYTES:
        size_mb = file_size / (1024 * 1024)
        return False, f'File size ({size_mb:.1f}MB) exceeds maximum ({MAX_FILE_SIZE_MB}MB)'
    
    if file_size == 0:
        return False, 'File is empty'
    
    return True, 'OK'


def get_allowed_extensions() -> List[str]:
    """
    Get list of allowed file extensions.
    
    Returns:
        List of allowed extensions
    """
    return sorted(list(ALLOWED_EXTENSIONS))