"""
Schema registry for canonical document structures.

Manages JSON schemas for different document types to ensure
consistent output format and validation.
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import json
import os


class SchemaType(Enum):
    """Schema types corresponding to document types."""
    ACORD_126 = "acord_126"
    ACORD_125 = "acord_125"
    ACORD_130 = "acord_130"
    ACORD_140 = "acord_140"
    LOSS_RUN = "loss_run"
    SOV = "sov"
    FINANCIAL_STATEMENT = "financial_statement"
    SUPPLEMENTAL = "supplemental"
    GENERIC = "generic"


class SchemaRegistry:
    """
    Registry for canonical document schemas.
    
    Provides centralized access to JSON schemas for different
    document types. Schemas define the expected structure of
    extracted data.
    
    Usage:
        registry = SchemaRegistry()
        schema = registry.get_schema(SchemaType.ACORD_126)
        is_valid = registry.validate_data(schema, extracted_data)
    """
    
    def __init__(self, schema_dir: Optional[str] = None):
        """
        Initialize schema registry.
        
        Args:
            schema_dir: Directory containing schema JSON files
                       (defaults to extraction/schemas/)
        """
        if schema_dir is None:
            # Default to schemas directory relative to this file
            current_dir = os.path.dirname(os.path.abspath(__file__))
            schema_dir = os.path.join(
                os.path.dirname(current_dir),
                'schemas'
            )
        
        self.schema_dir = schema_dir
        self._schemas: Dict[SchemaType, Dict[str, Any]] = {}
        self._load_schemas()
    
    def _load_schemas(self):
        """Load all schemas from schema directory."""
        if not os.path.exists(self.schema_dir):
            return
        
        # Map of schema files to schema types
        schema_files = {
            SchemaType.ACORD_126: 'acord_126_schema.json',
            SchemaType.ACORD_125: 'acord_125_schema.json',
            SchemaType.ACORD_130: 'acord_130_schema.json',
            SchemaType.ACORD_140: 'acord_140_schema.json',
            SchemaType.LOSS_RUN: 'loss_run_schema.json',
            SchemaType.SOV: 'sov_schema.json',
            SchemaType.FINANCIAL_STATEMENT: 'financial_schema.json',
            SchemaType.SUPPLEMENTAL: 'supplemental_schema.json',
            SchemaType.GENERIC: 'generic_schema.json'
        }
        
        for schema_type, filename in schema_files.items():
            schema_path = os.path.join(self.schema_dir, filename)
            if os.path.exists(schema_path):
                try:
                    with open(schema_path, 'r') as f:
                        self._schemas[schema_type] = json.load(f)
                except Exception as e:
                    print(f"Warning: Failed to load schema {filename}: {e}")
    
    def get_schema(self, schema_type: SchemaType) -> Optional[Dict[str, Any]]:
        """
        Get schema for a document type.
        
        Args:
            schema_type: Type of schema to retrieve
            
        Returns:
            Schema dictionary or None if not found
        """
        return self._schemas.get(schema_type)
    
    def has_schema(self, schema_type: SchemaType) -> bool:
        """
        Check if schema exists for a document type.
        
        Args:
            schema_type: Type of schema to check
            
        Returns:
            True if schema exists, False otherwise
        """
        return schema_type in self._schemas
    
    def get_required_fields(self, schema_type: SchemaType) -> List[str]:
        """
        Get list of required fields for a schema.
        
        Args:
            schema_type: Type of schema
            
        Returns:
            List of required field paths (e.g., ["applicant.business_name"])
        """
        schema = self.get_schema(schema_type)
        if not schema:
            return []
        
        # Extract required fields from schema
        required_fields = []
        
        def extract_required(obj: Dict[str, Any], path: str = ""):
            """Recursively extract required fields."""
            if isinstance(obj, dict):
                if 'required' in obj and isinstance(obj['required'], list):
                    for field in obj['required']:
                        field_path = f"{path}.{field}" if path else field
                        required_fields.append(field_path)
                
                if 'properties' in obj:
                    for key, value in obj['properties'].items():
                        new_path = f"{path}.{key}" if path else key
                        extract_required(value, new_path)
        
        extract_required(schema)
        return required_fields
    
    def validate_data(
        self,
        schema_type: SchemaType,
        data: Dict[str, Any]
    ) -> tuple[bool, List[str]]:
        """
        Validate data against schema.
        
        Args:
            schema_type: Schema to validate against
            data: Data to validate
            
        Returns:
            Tuple of (is_valid, list of error messages)
        """
        schema = self.get_schema(schema_type)
        if not schema:
            return False, [f"Schema not found for {schema_type.value}"]
        
        errors = []
        
        # Check required fields
        required_fields = self.get_required_fields(schema_type)
        for field_path in required_fields:
            if not self._has_field(data, field_path):
                errors.append(f"Missing required field: {field_path}")
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def _has_field(self, data: Dict[str, Any], field_path: str) -> bool:
        """
        Check if a nested field exists in data.
        
        Args:
            data: Data dictionary
            field_path: Dot-separated field path (e.g., "applicant.business_name")
            
        Returns:
            True if field exists and has a value, False otherwise
        """
        parts = field_path.split('.')
        current = data
        
        for part in parts:
            if not isinstance(current, dict) or part not in current:
                return False
            current = current[part]
        
        # Check if value is not None or empty string
        return current is not None and current != ""
    
    def get_all_schemas(self) -> Dict[SchemaType, Dict[str, Any]]:
        """
        Get all loaded schemas.
        
        Returns:
            Dictionary mapping schema types to schemas
        """
        return self._schemas.copy()
    
    def register_schema(
        self,
        schema_type: SchemaType,
        schema: Dict[str, Any]
    ):
        """
        Manually register a schema.
        
        Args:
            schema_type: Type of schema
            schema: Schema dictionary
        """
        self._schemas[schema_type] = schema
    
    def __repr__(self) -> str:
        """String representation."""
        loaded_count = len(self._schemas)
        types = ', '.join([st.value for st in self._schemas.keys()])
        return f"SchemaRegistry(loaded={loaded_count}, types=[{types}])"