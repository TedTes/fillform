"""
Submission template definitions.

Templates define expected document types, forms, and field structures
for different types of insurance submissions.
"""

from typing import Dict, List, Any


class SubmissionTemplate:
    """Base class for submission templates."""
    
    def __init__(
        self,
        template_id: str,
        name: str,
        description: str,
        expected_documents: List[str],
        suggested_forms: List[str],
        expected_fields: List[str]
    ):
        self.template_id = template_id
        self.name = name
        self.description = description
        self.expected_documents = expected_documents
        self.suggested_forms = suggested_forms
        self.expected_fields = expected_fields
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert template to dictionary."""
        return {
            'template_id': self.template_id,
            'name': self.name,
            'description': self.description,
            'expected_documents': self.expected_documents,
            'suggested_forms': self.suggested_forms,
            'expected_fields': self.expected_fields
        }


# Template Definitions
PROPERTY_RENEWAL = SubmissionTemplate(
    template_id='property_renewal',
    name='Property Renewal',
    description='Commercial property insurance renewal submission',
    expected_documents=[
        'Statement of Values (SOV)',
        'Loss Run Report',
        'Property Schedule',
        'Current Policy Declarations',
        'Building Valuations'
    ],
    suggested_forms=[
        'ACORD 126',  # Commercial Insurance Application
        'ACORD 140',  # Property Section
    ],
    expected_fields=[
        'applicant.business_name',
        'applicant.business_address',
        'properties',
        'property_values',
        'construction_type',
        'occupancy_type',
        'protection_class',
        'coverage_limits.building',
        'coverage_limits.contents',
        'coverage_limits.business_income',
        'prior_losses'
    ]
)

WC_QUOTE = SubmissionTemplate(
    template_id='wc_quote',
    name='Workers Comp Quote',
    description='New workers compensation insurance quote',
    expected_documents=[
        'Payroll Report',
        'Loss Run Report',
        'Employee Census',
        'OSHA Logs',
        'Safety Program Documentation'
    ],
    suggested_forms=[
        'ACORD 130',  # Workers Compensation Application
        'ACORD 126',  # Commercial Insurance Application
    ],
    expected_fields=[
        'applicant.business_name',
        'applicant.business_address',
        'applicant.naics_code',
        'payroll.total_annual',
        'payroll.by_class_code',
        'employee_count',
        'experience_mod',
        'prior_losses',
        'safety_programs'
    ]
)

GL_NEW_BUSINESS = SubmissionTemplate(
    template_id='gl_new_business',
    name='GL New Business',
    description='General liability new business submission',
    expected_documents=[
        'Business Description',
        'Loss Run Report',
        'Operations Schedule',
        'Subcontractor List',
        'Current Insurance Declarations'
    ],
    suggested_forms=[
        'ACORD 125',  # Commercial Insurance Application
        'ACORD 126',  # Commercial Insurance Application
    ],
    expected_fields=[
        'applicant.business_name',
        'applicant.business_address',
        'applicant.years_in_business',
        'operations_description',
        'annual_revenue',
        'number_of_employees',
        'coverage_limits.general_aggregate',
        'coverage_limits.products_completed_ops',
        'coverage_limits.each_occurrence',
        'prior_losses',
        'subcontractors'
    ]
)

CUSTOM = SubmissionTemplate(
    template_id='custom',
    name='Custom Submission',
    description='Custom insurance submission with flexible requirements',
    expected_documents=[
        'Supporting Documents (varies)',
    ],
    suggested_forms=[
        'ACORD 126',  # Default to general application
    ],
    expected_fields=[
        'applicant.business_name',
        'applicant.business_address',
    ]
)


# Template Registry
TEMPLATES: Dict[str, SubmissionTemplate] = {
    'property_renewal': PROPERTY_RENEWAL,
    'wc_quote': WC_QUOTE,
    'gl_new_business': GL_NEW_BUSINESS,
    'custom': CUSTOM,
}


def get_template(template_id: str) -> SubmissionTemplate:
    """
    Get template by ID.
    
    Args:
        template_id: Template identifier
        
    Returns:
        SubmissionTemplate instance
        
    Raises:
        ValueError: If template not found
    """
    if template_id not in TEMPLATES:
        raise ValueError(f"Template '{template_id}' not found")
    
    return TEMPLATES[template_id]


def list_templates() -> List[Dict[str, Any]]:
    """
    List all available templates.
    
    Returns:
        List of template dictionaries
    """
    return [template.to_dict() for template in TEMPLATES.values()]


def get_template_metadata(template_id: str) -> Dict[str, Any]:
    """
    Get template metadata without full details.
    
    Args:
        template_id: Template identifier
        
    Returns:
        Template metadata dictionary
    """
    template = get_template(template_id)
    return {
        'template_id': template.template_id,
        'name': template.name,
        'description': template.description,
    }