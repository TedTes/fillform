'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { TEMPLATES, type SubmissionTemplate } from '@/lib/submission-templates'

interface SubmissionTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  onSubmit: (name: string, templateType: string) => void
}

export default function SubmissionTemplateModal({
  isOpen,
  onClose,
  clientName,
  onSubmit,
}: SubmissionTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom')
  const [submissionName, setSubmissionName] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionName.trim()) return
    onSubmit(submissionName.trim(), selectedTemplate)
    // Reset form
    setSubmissionName('')
    setSelectedTemplate('custom')
    onClose()
  }

  const templates = Object.values(TEMPLATES)

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'transition-all duration-200'
    
    if (isSelected) {
      const selectedColors: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-500 ring-2 ring-blue-200',
        green: 'bg-green-50 border-green-500 ring-2 ring-green-200',
        purple: 'bg-purple-50 border-purple-500 ring-2 ring-purple-200',
        gray: 'bg-gray-50 border-gray-500 ring-2 ring-gray-200'
      }
      return `${baseClasses} ${selectedColors[color] || selectedColors.gray}`
    }
    
    return `${baseClasses} bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Submission</h2>
              <p className="text-sm text-gray-500 mt-0.5">for {clientName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">
              {/* Submission Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Name
                </label>
                <input
                  type="text"
                  value={submissionName}
                  onChange={(e) => setSubmissionName(e.target.value)}
                  placeholder="e.g., 2025 Property Renewal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                  required
                />
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 border-2 rounded-lg text-left ${getColorClasses(
                        template.color,
                        selectedTemplate === template.id
                      )}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Details */}
              {selectedTemplate && TEMPLATES[selectedTemplate] && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-3">
                    Expected Documents:
                  </h4>
                  <ul className="space-y-1.5">
                    {TEMPLATES[selectedTemplate].expectedDocuments.map((doc, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Suggested Forms:</span>{' '}
                      {TEMPLATES[selectedTemplate].suggestedForms.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!submissionName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Create Submission
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}