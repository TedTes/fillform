'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle2, ChevronRight } from 'lucide-react'
import type { FormTemplate } from '@/types/form'

interface FormTemplateSelectorProps {
  onSelect: (templateId: string) => void
  selectedTemplateId?: string
}

export default function FormTemplateSelector({
  onSelect,
  selectedTemplateId
}: FormTemplateSelectorProps) {
  const [templates, setTemplates] = useState<FormTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/forms/templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Select Submission Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map(template => (
          <button
            key={template.template_id}
            onClick={() => onSelect(template.template_id)}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 ${
              selectedTemplateId === template.template_id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
              </div>
              {selectedTemplateId === template.template_id && (
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            <div className="flex flex-wrap gap-2">
              {template.suggested_forms.slice(0, 2).map(form => (
                <span
                  key={form}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                >
                  {form}
                </span>
              ))}
              {template.suggested_forms.length > 2 && (
                <span className="px-2 py-1 text-xs font-medium text-gray-500">
                  +{template.suggested_forms.length - 2} more
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}