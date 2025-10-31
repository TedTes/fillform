'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Calendar,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react'
import type { DynamicForm, FormSection, FormField } from '@/types/form'

interface DynamicFormProps {
  submissionId: string
  onSave?: (data: Record<string, unknown>) => void
  readOnly?: boolean
}

export default function DynamicFormComponent({
  submissionId,
  onSave,
  readOnly = false
}: DynamicFormProps) {
  const [form, setForm] = useState<DynamicForm | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showOptional, setShowOptional] = useState(true)

  useEffect(() => {
    fetchForm()
  }, [submissionId, showOptional])

  const fetchForm = async () => {
    setLoading(true)

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/form?include_optional=${showOptional}`
      )
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load form')
      }

      setForm(data.form)

      // Initialize form data from field values
      const initialData: Record<string, unknown> = {}
      data.form.sections.forEach((section: FormSection) => {
        section.fields.forEach((field: FormField) => {
          if (field.value !== undefined && field.value !== null) {
            initialData[field.field_path] = field.value
          }
        })
      })
      setFormData(initialData)
    } catch (err) {
      console.error('Failed to load form:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const handleFieldChange = (fieldPath: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldPath]: value
    }))

    // Clear error for this field
    if (errors[fieldPath]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldPath]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    if (!form) return false

    const newErrors: Record<string, string> = {}

    form.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.field_path]

        // Check required fields
        if (field.required && !value) {
          newErrors[field.field_path] = `${field.label} is required`
          return
        }

        // Validate pattern
        if (value && field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(String(value))) {
            newErrors[field.field_path] = field.validation.message || 'Invalid format'
          }
        }

        // Validate min/max for numbers
        if (value && field.field_type === 'number') {
          const numValue = Number(value)
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            newErrors[field.field_path] = `Must be at least ${field.validation.min}`
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            newErrors[field.field_path] = `Must be at most ${field.validation.max}`
          }
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      // Convert flat form data back to nested structure
      const nestedData = unflattenData(formData)

      const response = await fetch(`/api/submissions/${submissionId}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: nestedData,
          user: 'user',
          notes: 'Updated via dynamic form'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save')
      }

      if (onSave) {
        onSave(nestedData)
      }

      // Show success message
      alert('Form saved successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save form')
    } finally {
      setSaving(false)
    }
  }

  const unflattenData = (flat: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    Object.entries(flat).forEach(([path, value]) => {
      const parts = path.split('.')
      let current  = result

      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          current[part] = value
        } else {
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part] as Record<string,unknown>
        }
      })
    })

    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No form available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Form</h2>
          <p className="text-sm text-gray-600 mt-1">
            {form.metadata.required_fields} required fields, {form.metadata.total_fields} total
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOptional}
              onChange={(e) => setShowOptional(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show optional fields
          </label>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-4">
        {form.sections.map(section => (
          <FormSectionComponent
            key={section.section_id}
            section={section}
            isCollapsed={collapsedSections.has(section.section_id)}
            onToggle={() => toggleSection(section.section_id)}
            formData={formData}
            errors={errors}
            readOnly={readOnly}
            onFieldChange={handleFieldChange}
          />
        ))}
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Please fix the following errors:</p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {Object.values(errors).map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Form Section Component
interface FormSectionComponentProps {
  section: FormSection
  isCollapsed: boolean
  onToggle: () => void
  formData: Record<string, unknown>
  errors: Record<string, string>
  readOnly: boolean
  onFieldChange: (fieldPath: string, value: unknown) => void
}

function FormSectionComponent({
  section,
  isCollapsed,
  onToggle,
  formData,
  errors,
  readOnly,
  onFieldChange
}: FormSectionComponentProps) {
  const hasErrors = section.fields.some(field => errors[field.field_path])

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>
        {hasErrors && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </button>

      {/* Section Fields */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(field => (
              <FormFieldComponent
                key={field.field_id}
                field={field}
                value={formData[field.field_path]}
                error={errors[field.field_path]}
                readOnly={readOnly}
                onChange={(value) => onFieldChange(field.field_path, value)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Form Field Component
interface FormFieldComponentProps {
  field: FormField
  value: unknown
  error?: string
  readOnly: boolean
  onChange: (value: unknown) => void
}

function FormFieldComponent({
  field,
  value,
  error,
  readOnly,
  onChange
}: FormFieldComponentProps) {
  const getFieldIcon = () => {
    switch (field.field_type) {
      case 'email':
        return <Mail className="w-4 h-4 text-gray-400" />
      case 'tel':
        return <Phone className="w-4 h-4 text-gray-400" />
      case 'date':
        return <Calendar className="w-4 h-4 text-gray-400" />
      case 'number':
        return <DollarSign className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const renderInput = () => {
    const commonClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      error ? 'border-red-300' : 'border-gray-300'
    } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            disabled={readOnly}
            rows={4}
            className={commonClasses}
          />
        )

      case 'select':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={commonClasses}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={readOnly}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        )

      default:
        return (
          <div className="relative">
            {getFieldIcon() && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {getFieldIcon()}
              </div>
            )}
            <input
              type={field.field_type}
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              disabled={readOnly}
              className={`${commonClasses} ${getFieldIcon() ? 'pl-10' : ''}`}
            />
          </div>
        )
    }
  }

  return (
    <div className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
      <label className="block">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
          {field.help_text && (
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {field.help_text}
              </div>
            </div>
          )}
        </div>
        {renderInput()}
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </label>
    </div>
  )
}