"""
Comparison service - compares and resolves conflicts between data sources.
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime


class ComparisonService:
    """
    Service for comparing data from multiple sources and resolving conflicts.
    
    Features:
    - Compare extracted data vs manual edits
    - Compare data from multiple documents
    - Detect conflicts and inconsistencies
    - Provide merge suggestions
    - Track resolution decisions
    """
    
    def __init__(self, storage_dir: str = 'storage'):
        """Initialize comparison service."""
        self.storage_dir = storage_dir
        self.comparisons_dir = os.path.join(storage_dir, 'comparisons')
        os.makedirs(self.comparisons_dir, exist_ok=True)
    
    def compare_data(
        self,
        source_a: Dict[str, Any],
        source_b: Dict[str, Any],
        source_a_label: str = 'Source A',
        source_b_label: str = 'Source B'
    ) -> Dict[str, Any]:
        """
        Compare two data sources and identify differences.
        
        Args:
            source_a: First data source
            source_b: Second data source
            source_a_label: Label for first source
            source_b_label: Label for second source
            
        Returns:
            Comparison result with conflicts and differences
        """
        flat_a = self._flatten_dict(source_a)
        flat_b = self._flatten_dict(source_b)
        
        conflicts = []
        only_in_a = []
        only_in_b = []
        matching = []
        
        all_keys = set(flat_a.keys()) | set(flat_b.keys())
        
        for key in sorted(all_keys):
            value_a = flat_a.get(key)
            value_b = flat_b.get(key)
            
            if key in flat_a and key in flat_b:
                if value_a != value_b:
                    # Conflict - different values
                    conflicts.append({
                        'field': key,
                        'value_a': value_a,
                        'value_b': value_b,
                        'source_a': source_a_label,
                        'source_b': source_b_label,
                        'conflict_type': 'value_mismatch',
                        'severity': self._assess_conflict_severity(key, value_a, value_b)
                    })
                else:
                    # Matching values
                    matching.append({
                        'field': key,
                        'value': value_a
                    })
            elif key in flat_a:
                # Only in source A
                only_in_a.append({
                    'field': key,
                    'value': value_a,
                    'source': source_a_label
                })
            else:
                # Only in source B
                only_in_b.append({
                    'field': key,
                    'value': value_b,
                    'source': source_b_label
                })
        
        return {
            'comparison_id': self._generate_comparison_id(),
            'compared_at': datetime.utcnow().isoformat(),
            'source_a_label': source_a_label,
            'source_b_label': source_b_label,
            'summary': {
                'conflicts': len(conflicts),
                'only_in_a': len(only_in_a),
                'only_in_b': len(only_in_b),
                'matching': len(matching),
                'total_fields': len(all_keys)
            },
            'conflicts': conflicts,
            'only_in_a': only_in_a,
            'only_in_b': only_in_b,
            'matching': matching
        }
    
    def suggest_resolution(
        self,
        conflict: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Suggest resolution for a conflict.
        
        Args:
            conflict: Conflict information
            context: Additional context (confidence scores, sources, etc.)
            
        Returns:
            Resolution suggestion
        """
        field = conflict['field']
        value_a = conflict['value_a']
        value_b = conflict['value_b']
        severity = conflict['severity']
        
        # Default suggestion based on field type and context
        suggestion = {
            'field': field,
            'recommended_action': 'manual_review',
            'recommended_value': None,
            'reasoning': '',
            'alternatives': []
        }
        
        # Check if we have confidence scores
        if context and 'confidence_a' in context and 'confidence_b' in context:
            conf_a = context['confidence_a']
            conf_b = context['confidence_b']
            
            if conf_a > conf_b + 0.2:  # Significantly higher
                suggestion['recommended_action'] = 'use_a'
                suggestion['recommended_value'] = value_a
                suggestion['reasoning'] = f"Source A has higher confidence ({conf_a:.0%} vs {conf_b:.0%})"
            elif conf_b > conf_a + 0.2:
                suggestion['recommended_action'] = 'use_b'
                suggestion['recommended_value'] = value_b
                suggestion['reasoning'] = f"Source B has higher confidence ({conf_b:.0%} vs {conf_a:.0%})"
        
        # Field-specific logic
        if severity == 'low':
            # For low severity conflicts, can suggest merge or either value
            if self._is_numeric(value_a) and self._is_numeric(value_b):
                avg = (float(value_a) + float(value_b)) / 2
                suggestion['alternatives'].append({
                    'action': 'average',
                    'value': avg,
                    'reasoning': 'Use average of both values'
                })
        
        # Add "use A" and "use B" as alternatives
        suggestion['alternatives'].append({
            'action': 'use_a',
            'value': value_a,
            'reasoning': f"Use value from {conflict['source_a']}"
        })
        suggestion['alternatives'].append({
            'action': 'use_b',
            'value': value_b,
            'reasoning': f"Use value from {conflict['source_b']}"
        })
        
        return suggestion
    
    def resolve_conflict(
        self,
        comparison_id: str,
        field: str,
        resolution: Dict[str, Any],
        user: str = 'user'
    ) -> Dict[str, Any]:
        """
        Record a conflict resolution.
        
        Args:
            comparison_id: Comparison identifier
            field: Field being resolved
            resolution: Resolution details (action, value, reasoning)
            user: User who made the resolution
            
        Returns:
            Resolution record
        """
        resolution_record = {
            'comparison_id': comparison_id,
            'field': field,
            'action': resolution['action'],
            'selected_value': resolution.get('value'),
            'reasoning': resolution.get('reasoning', ''),
            'resolved_by': user,
            'resolved_at': datetime.utcnow().isoformat()
        }
        
        # Save resolution
        resolutions_file = os.path.join(
            self.comparisons_dir,
            f"{comparison_id}_resolutions.json"
        )
        
        resolutions = []
        if os.path.exists(resolutions_file):
            with open(resolutions_file, 'r') as f:
                resolutions = json.load(f)
        
        resolutions.append(resolution_record)
        
        with open(resolutions_file, 'w') as f:
            json.dump(resolutions, f, indent=2)
        
        return resolution_record
    
    def apply_resolutions(
        self,
        base_data: Dict[str, Any],
        resolutions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Apply conflict resolutions to base data.
        
        Args:
            base_data: Base data to modify
            resolutions: List of resolution records
            
        Returns:
            Updated data with resolutions applied
        """
        result = json.loads(json.dumps(base_data))  # Deep copy
        
        for resolution in resolutions:
            field = resolution['field']
            value = resolution.get('selected_value')
            action = resolution['action']
            
            if action in ['use_a', 'use_b', 'average', 'manual']:
                # Set the value
                self._set_nested_value(result, field, value)
            elif action == 'delete':
                # Remove the field
                self._delete_nested_value(result, field)
        
        return result
    
    # Helper methods
    
    def _generate_comparison_id(self) -> str:
        """Generate unique comparison ID."""
        import uuid
        return str(uuid.uuid4())
    
    def _flatten_dict(
        self,
        d: Dict[str, Any],
        parent_key: str = '',
        sep: str = '.'
    ) -> Dict[str, Any]:
        """Flatten nested dictionary."""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
    
    def _assess_conflict_severity(
        self,
        field: str,
        value_a: Any,
        value_b: Any
    ) -> str:
        """
        Assess severity of conflict.
        
        Returns: 'high', 'medium', or 'low'
        """
        # Critical fields
        critical_fields = [
            'applicant.business_name',
            'policy_number',
            'effective_date',
            'expiration_date'
        ]
        
        if field in critical_fields:
            return 'high'
        
        # Check if values are similar
        if self._is_numeric(value_a) and self._is_numeric(value_b):
            diff_percent = abs(float(value_a) - float(value_b)) / max(float(value_a), float(value_b))
            if diff_percent < 0.1:  # Less than 10% difference
                return 'low'
            elif diff_percent < 0.3:  # 10-30% difference
                return 'medium'
            else:
                return 'high'
        
        # Check string similarity
        if isinstance(value_a, str) and isinstance(value_b, str):
            # Simple similarity check
            if value_a.lower().strip() == value_b.lower().strip():
                return 'low'  # Just formatting difference
        
        return 'medium'  # Default
    
    def _is_numeric(self, value: Any) -> bool:
        """Check if value is numeric."""
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False
    
    def _set_nested_value(self, d: Dict[str, Any], path: str, value: Any):
        """Set value in nested dictionary using dot notation."""
        keys = path.split('.')
        current = d
        
        for key in keys[:-1]:
            if key not in current:
                current[key] = {}
            current = current[key]
        
        current[keys[-1]] = value
    
    def _delete_nested_value(self, d: Dict[str, Any], path: str):
        """Delete value from nested dictionary using dot notation."""
        keys = path.split('.')
        current = d
        
        for key in keys[:-1]:
            if key not in current:
                return
            current = current[key]
        
        if keys[-1] in current:
            del current[keys[-1]]