"""
Utility functions for PDF parsing.
"""

from typing import Any, Optional


def normalize_checkbox_value(value: Any) -> bool:
    """
    Normalize checkbox values to boolean.
    
    PDF checkboxes can have values like:
    - "/Yes", "/Off"
    - "/1", "/0"
    - "Yes", "No"
    - True, False
    
    Args:
        value: Raw checkbox value from PDF
        
    Returns:
        True if checked, False otherwise
    """
    if value is None:
        return False
    
    # Convert to string for comparison
    value_str = str(value).lower().strip()
    
    # Common "checked" values
    checked_values = {
        '/yes', 'yes', '/1', '1', 'true', 'on', '/on'
    }
    
    return value_str in checked_values


def clean_field_value(value: Any) -> Optional[str]:
    """
    Clean and normalize field value.
    
    - Remove leading/trailing whitespace
    - Remove PDF-specific prefixes (e.g., "/")
    - Return None for empty values
    
    Args:
        value: Raw field value
        
    Returns:
        Cleaned string value or None
    """
    if value is None:
        return None
    
    # Convert to string
    value_str = str(value).strip()
    
    # Remove PDF name prefix if present
    if value_str.startswith('/'):
        value_str = value_str[1:]
    
    # Return None for empty strings
    if not value_str:
        return None
    
    return value_str


def parse_money_value(value: Any) -> Optional[float]:
    """
    Parse money value from PDF field.
    
    Handles formats like:
    - "$1,000,000"
    - "1000000"
    - "1,000,000.00"
    
    Args:
        value: Raw money value
        
    Returns:
        Float value or None if invalid
    """
    if value is None:
        return None
    
    # Convert to string and clean
    value_str = str(value).strip()
    
    # Remove currency symbols and commas
    value_str = value_str.replace('$', '').replace(',', '')
    
    try:
        return float(value_str)
    except ValueError:
        return None


def parse_date_value(value: Any) -> Optional[str]:
    """
    Parse date value from PDF field.
    
    Returns date as-is (string) without transformation.
    Date formatting will be handled by mapper layer.
    
    Args:
        value: Raw date value
        
    Returns:
        String date value or None
    """
    if value is None:
        return None
    
    value_str = str(value).strip()
    
    if not value_str:
        return None
    
    return value_str