/**
 * Frontend submission template definitions and utilities.
 */

export interface SubmissionTemplate {
    id: string
    name: string
    description: string
    icon: string
    color: string
    expectedDocuments: string[]
    suggestedForms: string[]
  }
  
  export const TEMPLATES: Record<string, SubmissionTemplate> = {
    property_renewal: {
      id: 'property_renewal',
      name: 'Property Renewal',
      description: 'Commercial property insurance renewal submission',
      icon: '🏢',
      color: 'blue',
      expectedDocuments: [
        'Statement of Values (SOV)',
        'Loss Run Report',
        'Property Schedule',
        'Current Policy Declarations',
        'Building Valuations'
      ],
      suggestedForms: ['ACORD 126', 'ACORD 140']
    },
    wc_quote: {
      id: 'wc_quote',
      name: 'Workers Comp Quote',
      description: 'New workers compensation insurance quote',
      icon: '👷',
      color: 'green',
      expectedDocuments: [
        'Payroll Report',
        'Loss Run Report',
        'Employee Census',
        'OSHA Logs',
        'Safety Program Documentation'
      ],
      suggestedForms: ['ACORD 130', 'ACORD 126']
    },
    gl_new_business: {
      id: 'gl_new_business',
      name: 'GL New Business',
      description: 'General liability new business submission',
      icon: '🛡️',
      color: 'purple',
      expectedDocuments: [
        'Business Description',
        'Loss Run Report',
        'Operations Schedule',
        'Subcontractor List',
        'Current Insurance Declarations'
      ],
      suggestedForms: ['ACORD 125', 'ACORD 126']
    },
    custom: {
      id: 'custom',
      name: 'Custom Submission',
      description: 'Custom insurance submission with flexible requirements',
      icon: '✨',
      color: 'gray',
      expectedDocuments: ['Supporting Documents (varies)'],
      suggestedForms: ['ACORD 126']
    }
  }
  
  export function getTemplate(id: string): SubmissionTemplate | undefined {
    return TEMPLATES[id]
  }
  
  export function listTemplates(): SubmissionTemplate[] {
    return Object.values(TEMPLATES)
  }
  
  export function getTemplateColor(templateId?: string): string {
    if (!templateId) return 'gray'
    return TEMPLATES[templateId]?.color || 'gray'
  }
  
  export function getTemplateIcon(templateId?: string): string {
    if (!templateId) return '📁'
    return TEMPLATES[templateId]?.icon || '📁'
  }