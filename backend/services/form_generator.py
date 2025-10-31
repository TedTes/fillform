"""
Form generator - creates context-aware dynamic forms based on templates and data.
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class FormField:
    """Represents a single form field with metadata."""
    
    def __init__(
        self,
        field_id: str,
        field_path: str,
        label: str,
        field_type: str,
        value: Any = None,
        required: bool = False,
        placeholder: str = '',
        help_text: str = '',
        validation: Optional[Dict[str, Any]] = None,
        options: Optional[List[Dict[str, str]]] = None,
        conditional: Optional[Dict[str, Any]] = None,
        section: str = '',
        order: int = 0
    ):
        self.field_id = field_id
        self.field_path = field_path
        self.label = label
        self.field_type = field_type
        self.value = value
        self.required = required
        self.placeholder = placeholder
        self.help_text = help_text
        self.validation = validation or {}
        self.options = options or []
        self.conditional = conditional
        self.section = section
        self.order = order
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'field_id': self.field_id,
            'field_path': self.field_path,
            'label': self.label,
            'field_type': self.field_type,
            'value': self.value,
            'required': self.required,
            'placeholder': self.placeholder,
            'help_text': self.help_text,
            'validation': self.validation,
            'options': self.options,
            'conditional': self.conditional,
            'section': self.section,
            'order': self.order
        }


class FormSection:
    """Represents a section of form fields."""
    
    def __init__(
        self,
        section_id: str,
        title: str,
        description: str = '',
        order: int = 0,
        collapsible: bool = True,
        fields: Optional[List[FormField]] = None
    ):
        self.section_id = section_id
        self.title = title
        self.description = description
        self.order = order
        self.collapsible = collapsible
        self.fields = fields or []
    
    def add_field(self, field: FormField):
        """Add a field to this section."""
        field.section = self.section_id
        self.fields.append(field)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'section_id': self.section_id,
            'title': self.title,
            'description': self.description,
            'order': self.order,
            'collapsible': self.collapsible,
            'fields': [field.to_dict() for field in sorted(self.fields, key=lambda f: f.order)]
        }


class FormGenerator:
    """
    Generates context-aware dynamic forms.
    
    Features:
    - Generate forms based on submission templates
    - Pre-populate with extracted data
    - Conditional field visibility
    - Smart field ordering
    - Validation rules
    - Help text and hints
    """
    
    def __init__(self, templates_dir: str = 'backend/lib/form_templates'):
        """Initialize form generator."""
        self.templates_dir = templates_dir
        os.makedirs(templates_dir, exist_ok=True)
        self._field_definitions = self._load_field_definitions()
    
    def generate_form(
        self,
        template_id: str,
        data: Optional[Dict[str, Any]] = None,
        include_optional: bool = True
    ) -> Dict[str, Any]:
        """
        Generate a form based on template and data.
        
        Args:
            template_id: Template identifier (e.g., 'property_renewal')
            data: Existing data to pre-populate form
            include_optional: Include optional fields
            
        Returns:
            Form definition with sections and fields
        """
        # Get template-specific fields
        template_fields = self._get_template_fields(template_id)
        
        # Create sections
        sections = self._organize_into_sections(template_fields, template_id)
        
        # Populate with data if provided
        if data:
            self._populate_fields(sections, data)
        
        # Add context-aware hints based on data
        if data:
            self._add_contextual_hints(sections, data)
        
        # Filter optional fields if needed
        if not include_optional:
            sections = self._filter_optional_fields(sections)
        
        return {
            'form_id': f"{template_id}_form",
            'template_id': template_id,
            'generated_at': datetime.utcnow().isoformat(),
            'sections': [section.to_dict() for section in sorted(sections, key=lambda s: s.order)],
            'metadata': {
                'total_fields': sum(len(section.fields) for section in sections),
                'required_fields': sum(
                    sum(1 for field in section.fields if field.required)
                    for section in sections
                )
            }
        }
    
    def _get_template_fields(self, template_id: str) -> List[str]:
        """Get expected fields for a template."""
        # Map templates to field lists
        template_fields = {
            'property_renewal': [
                'applicant.business_name',
                'applicant.business_address.line_one',
                'applicant.business_address.city',
                'applicant.business_address.state',
                'applicant.business_address.postal_code',
                'applicant.contact_name',
                'applicant.contact_phone',
                'applicant.contact_email',
                'coverage_information.effective_date',
                'coverage_information.expiration_date',
                'coverage_information.prior_policy_number',
                'properties',
                'property_values.total_building_value',
                'property_values.total_contents_value',
                'construction_type',
                'occupancy_type',
                'protection_class',
                'prior_losses',
            ],
            'wc_quote': [
                'applicant.business_name',
                'applicant.business_address.line_one',
                'applicant.business_address.city',
                'applicant.business_address.state',
                'applicant.business_address.postal_code',
                'applicant.naics_code',
                'applicant.years_in_business',
                'coverage_information.effective_date',
                'coverage_information.expiration_date',
                'payroll.total_annual',
                'payroll.by_class_code',
                'employee_count',
                'experience_mod',
                'prior_losses',
                'safety_programs',
            ],
            'gl_new_business': [
                'applicant.business_name',
                'applicant.business_address.line_one',
                'applicant.business_address.city',
                'applicant.business_address.state',
                'applicant.business_address.postal_code',
                'applicant.years_in_business',
                'coverage_information.effective_date',
                'coverage_information.expiration_date',
                'operations_description',
                'annual_revenue',
                'number_of_employees',
                'coverage_limits.general_aggregate',
                'coverage_limits.products_completed_ops',
                'coverage_limits.each_occurrence',
                'prior_losses',
                'subcontractors',
            ],
            'custom': [
                'applicant.business_name',
                'applicant.business_address.line_one',
                'applicant.business_address.city',
                'applicant.business_address.state',
                'applicant.business_address.postal_code',
                'coverage_information.effective_date',
                'coverage_information.expiration_date',
            ]
        }
        
        return template_fields.get(template_id, template_fields['custom'])
    
    def _organize_into_sections(
        self,
        field_paths: List[str],
        template_id: str
    ) -> List[FormSection]:
        """Organize fields into logical sections."""
        sections_map = {}
        
        for field_path in field_paths:
            # Determine section based on field path
            section_id = self._get_section_for_field(field_path, template_id)
            
            if section_id not in sections_map:
                sections_map[section_id] = self._create_section(section_id, template_id)
            
            # Create field
            field = self._create_field(field_path)
            sections_map[section_id].add_field(field)
        
        return list(sections_map.values())
    
    def _get_section_for_field(self, field_path: str, template_id: str) -> str:
        """Determine which section a field belongs to."""
        if field_path.startswith('applicant.'):
            return 'applicant_info'
        elif field_path.startswith('coverage_'):
            return 'coverage_info'
        elif field_path.startswith('property') or field_path.startswith('properties'):
            return 'property_info'
        elif field_path.startswith('payroll') or field_path.startswith('employee'):
            return 'payroll_info'
        elif 'loss' in field_path.lower() or 'claim' in field_path.lower():
            return 'loss_history'
        elif field_path.startswith('operations') or field_path.startswith('subcontractor'):
            return 'operations'
        else:
            return 'additional_info'
    
    def _create_section(self, section_id: str, template_id: str) -> FormSection:
        """Create a section with metadata."""
        section_configs = {
            'applicant_info': {
                'title': 'Applicant Information',
                'description': 'Basic information about the insured',
                'order': 1
            },
            'coverage_info': {
                'title': 'Coverage Information',
                'description': 'Policy coverage details and dates',
                'order': 2
            },
            'property_info': {
                'title': 'Property Details',
                'description': 'Property and building information',
                'order': 3
            },
            'payroll_info': {
                'title': 'Payroll & Employees',
                'description': 'Employee and payroll information',
                'order': 4
            },
            'operations': {
                'title': 'Business Operations',
                'description': 'Description of business operations',
                'order': 5
            },
            'loss_history': {
                'title': 'Loss History',
                'description': 'Prior claims and losses',
                'order': 6
            },
            'additional_info': {
                'title': 'Additional Information',
                'description': 'Other relevant details',
                'order': 99
            }
        }
        
        config = section_configs.get(section_id, {
            'title': section_id.replace('_', ' ').title(),
            'description': '',
            'order': 50
        })
        
        return FormSection(
            section_id=section_id,
            title=config['title'],
            description=config['description'],
            order=config['order']
        )
    
    def _create_field(self, field_path: str) -> FormField:
        """Create a field with metadata."""
        # Get field definition if available
        field_def = self._field_definitions.get(field_path, {})
        
        # Generate label from path
        label = field_def.get('label', self._generate_label(field_path))
        
        # Determine field type
        field_type = field_def.get('type', self._infer_field_type(field_path))
        
        # Check if required
        required = field_def.get('required', self._is_required_field(field_path))
        
        return FormField(
            field_id=field_path.replace('.', '_'),
            field_path=field_path,
            label=label,
            field_type=field_type,
            required=required,
            placeholder=field_def.get('placeholder', ''),
            help_text=field_def.get('help_text', ''),
            validation=field_def.get('validation', {}),
            options=field_def.get('options', []),
            order=field_def.get('order', 0)
        )
    
    def _generate_label(self, field_path: str) -> str:
        """Generate human-readable label from field path."""
        # Get last part of path
        parts = field_path.split('.')
        label = parts[-1]
        
        # Convert snake_case to Title Case
        label = label.replace('_', ' ').title()
        
        return label
    
    def _infer_field_type(self, field_path: str) -> str:
        """Infer field type from path."""
        lower_path = field_path.lower()
        
        if 'date' in lower_path:
            return 'date'
        elif 'email' in lower_path:
            return 'email'
        elif 'phone' in lower_path:
            return 'tel'
        elif 'address' in lower_path:
            return 'text'
        elif 'description' in lower_path or 'operations' in lower_path:
            return 'textarea'
        elif any(x in lower_path for x in ['amount', 'value', 'revenue', 'payroll', 'limit']):
            return 'number'
        elif field_path.endswith('[]') or 'properties' in lower_path or 'losses' in lower_path:
            return 'array'
        else:
            return 'text'
    
    def _is_required_field(self, field_path: str) -> bool:
        """Check if field is required."""
        required_fields = [
            'applicant.business_name',
            'applicant.business_address.line_one',
            'applicant.business_address.city',
            'applicant.business_address.state',
            'applicant.business_address.postal_code',
            'coverage_information.effective_date',
            'coverage_information.expiration_date'
        ]
        
        return field_path in required_fields
    
    def _populate_fields(self, sections: List[FormSection], data: Dict[str, Any]):
        """Populate fields with existing data."""
        flat_data = self._flatten_dict(data)
        
        for section in sections:
            for field in section.fields:
                if field.field_path in flat_data:
                    field.value = flat_data[field.field_path]
    
    def _add_contextual_hints(self, sections: List[FormSection], data: Dict[str, Any]):
        """Add context-aware hints based on data."""
        # Example: If we have prior losses, add hint about loss history
        flat_data = self._flatten_dict(data)
        
        for section in sections:
            if section.section_id == 'loss_history':
                if 'prior_losses' in flat_data and flat_data['prior_losses']:
                    section.description = '⚠️ Prior losses detected. Please review and update as needed.'
    
    def _filter_optional_fields(self, sections: List[FormSection]) -> List[FormSection]:
        """Filter out optional fields."""
        filtered_sections = []
        
        for section in sections:
            required_fields = [f for f in section.fields if f.required]
            if required_fields:
                new_section = FormSection(
                    section_id=section.section_id,
                    title=section.title,
                    description=section.description,
                    order=section.order,
                    fields=required_fields
                )
                filtered_sections.append(new_section)
        
        return filtered_sections
    
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
    
    def _load_field_definitions(self) -> Dict[str, Dict[str, Any]]:
        """Load field definitions from configuration."""
        # This would typically load from a JSON file
        # For now, return hardcoded common fields
        return {
            'applicant.business_name': {
                'label': 'Business Name',
                'type': 'text',
                'required': True,
                'placeholder': 'Enter business legal name',
                'help_text': 'Legal name as it appears on tax documents'
            },
            'applicant.contact_email': {
                'label': 'Contact Email',
                'type': 'email',
                'required': False,
                'placeholder': 'email@example.com',
                'validation': {
                    'pattern': '^[^@]+@[^@]+\\.[^@]+$',
                    'message': 'Please enter a valid email address'
                }
            },
            'applicant.contact_phone': {
                'label': 'Contact Phone',
                'type': 'tel',
                'required': False,
                'placeholder': '(555) 123-4567',
                'validation': {
                    'pattern': '^\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
                    'message': 'Please enter a valid phone number'
                }
            },
            'coverage_information.effective_date': {
                'label': 'Effective Date',
                'type': 'date',
                'required': True,
                'help_text': 'Date when coverage begins'
            },
            'coverage_information.expiration_date': {
                'label': 'Expiration Date',
                'type': 'date',
                'required': True,
                'help_text': 'Date when coverage ends'
            },
            'applicant.business_address.state': {
                'label': 'State',
                'type': 'select',
                'required': True,
                'options': [
                    {'value': 'AL', 'label': 'Alabama'},
                    {'value': 'AK', 'label': 'Alaska'},
                    {'value': 'AZ', 'label': 'Arizona'},
                    {'value': 'CA', 'label': 'California'},
                    {'value': 'FL', 'label': 'Florida'},
                    {'value': 'NY', 'label': 'New York'},
                    {'value': 'TX', 'label': 'Texas'},
                    # Add more states as needed
                ]
            }
        }