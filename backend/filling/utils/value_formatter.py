"""
Value formatter for PDF field values.

Handles formatting of dates, money, and other data types
for PDF form fields.
"""

from typing import Any, Optional


class ValueFormatter:
    """
    Formats values for PDF form fields.
    
    Handles:
    - Date formatting (YYYY-MM-DD → MM/DD/YYYY)
    - Money formatting (1000000 → $1,000,000)
    - Boolean formatting for checkboxes
    """
    
    @staticmethod
    def format_value(val: Any, hint: Optional[str] = None) -> str:
        """
        Format value based on hint.
        
        Args:
            val: Value to format
            hint: Format hint (e.g., "date:mm/dd/yyyy", "money:$")
            
        Returns:
            Formatted string value
            
        Examples:
            >>> ValueFormatter.format_value("2025-01-15", "date:mm/dd/yyyy")
            "01/15/2025"
            
            >>> ValueFormatter.format_value(1000000, "money:$")
            "$1,000,000"
        """
        if val is None:
            return ""
        
        if not hint:
            return str(val)
        
        s = str(val)
        kind, _, spec = hint.partition(":")
        
        if kind == "date":
            return ValueFormatter.format_date(s)
        elif kind == "money":
            return ValueFormatter.format_money(val)
        
        return s
    
    @staticmethod
    def format_date(value: Any) -> str:
        """
        Format date value.
        
        Converts 'YYYY-MM-DD' → 'MM/DD/YYYY'
        Returns as-is if not in expected format.
        
        Args:
            value: Date value (string or other)
            
        Returns:
            Formatted date string
        """
        if value is None:
            return ""
        
        s = str(value)
        
        # Try to convert YYYY-MM-DD to MM/DD/YYYY
        if "-" in s and len(s) >= 10:
            try:
                y, m, d = s[:10].split("-")
                return f"{m}/{d}/{y}"
            except Exception:
                return s
        
        return s
    
    @staticmethod
    def format_money(value: Any) -> str:
        """
        Format money value.
        
        Formats number with dollar sign and comma separators.
        
        Args:
            value: Numeric value
            
        Returns:
            Formatted money string (e.g., "$1,000,000")
        """
        if value is None:
            return ""
        
        try:
            n = float(value)
            return f"${n:,.0f}"
        except Exception:
            return str(value)
    
    @staticmethod
    def format_checkbox(value: Any, on_value: str = "/Yes") -> str:
        """
        Format boolean value for checkbox field.
        
        Args:
            value: Boolean or string value
            on_value: Value to use when checkbox is "on"
            
        Returns:
            Checkbox state value (on_value or "Off")
        """
        truthy = {True, "true", "yes", "y", "on", "1", 1}
        
        if value in truthy:
            return on_value
        
        # Check string values
        if isinstance(value, str):
            val_norm = value.strip().lower()
            if val_norm in {"true", "yes", "y", "on", "1"}:
                return on_value
        
        return "Off"