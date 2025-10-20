"""
JSON navigation utilities for deep access to nested structures.

Shared between extraction and filling modules.
"""

from typing import Any, Dict, Optional


class JsonNavigator:
    """
    Navigate and manipulate nested JSON structures using dot notation.
    
    Supports:
    - Nested dictionary access: "applicant.business_name"
    - Array indices: "additional_interests[0].name"
    - Deep setting values
    """
    
    @staticmethod
    def deep_get(obj: Dict[str, Any], dotted: str) -> Any:
        """
        Get nested value by dotted path with optional array indices.
        
        Args:
            obj: Dictionary to traverse
            dotted: Dotted path (e.g., "applicant.business_name" or "additional_interests[0].name")
            
        Returns:
            Value at path or None if not found
            
        Examples:
            >>> data = {"applicant": {"business_name": "ABC Corp"}}
            >>> JsonNavigator.deep_get(data, "applicant.business_name")
            "ABC Corp"
            
            >>> data = {"interests": [{"name": "Bank"}]}
            >>> JsonNavigator.deep_get(data, "interests[0].name")
            "Bank"
        """
        cur: Any = obj
        
        for part in dotted.split("."):
            # Handle array indices like 'foo[0]'
            while True:
                if "[" in part and part.endswith("]"):
                    key, idx_str = part[:part.index("[")], part[part.index("[")+1:-1]
                    
                    if not isinstance(cur, dict) or key not in cur:
                        return None
                    
                    cur = cur[key]
                    
                    try:
                        idx = int(idx_str)
                    except Exception:
                        return None
                    
                    if not isinstance(cur, list) or idx >= len(cur):
                        return None
                    
                    cur = cur[idx]
                    
                    # Check for nested brackets (e.g., a[0][1])
                    open_brack = part.find("[", part.index("[")+1)
                    if open_brack == -1:
                        break
                    part = part[open_brack:]  # Continue with next bracket level
                else:
                    # Plain dictionary access
                    if isinstance(cur, dict) and part in cur:
                        cur = cur[part]
                    else:
                        return None
                    break
        
        return cur
    
    @staticmethod
    def deep_set(obj: Dict[str, Any], dotted: str, value: Any) -> None:
        """
        Set nested value by dotted path.
        
        Creates intermediate dictionaries as needed.
        Does not support array indices (for simplicity).
        
        Args:
            obj: Dictionary to modify
            dotted: Dotted path (e.g., "applicant.business_name")
            value: Value to set
            
        Examples:
            >>> data = {}
            >>> JsonNavigator.deep_set(data, "applicant.business_name", "ABC Corp")
            >>> data
            {"applicant": {"business_name": "ABC Corp"}}
        """
        keys = dotted.split(".")
        current = obj
        
        # Navigate to parent
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        # Set value
        current[keys[-1]] = value