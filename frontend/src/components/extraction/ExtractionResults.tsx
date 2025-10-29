'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import type { ExtractionResult } from '@/types/extraction'

interface ExtractionResultsProps {
  result: ExtractionResult
  filename: string
  onEdit?: (field: string, value: string) => void
  showMetadata?: boolean
  className?: string
}

export default function ExtractionResults({
  result,
  filename,
  onEdit,
  showMetadata = true,
  className = '',
}: ExtractionResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // Get confidence level styling
  const getConfidenceStyle = (confidence: number): {
    color: string
    bgColor: string
    label: string
  } => {
    if (confidence >= 0.8) {
      return { color: 'text-green-700', bgColor: 'bg-green-50', label: 'High' }
    }
    if (confidence >= 0.6) {
      return { color: 'text-yellow-700', bgColor: 'bg-yellow-50', label: 'Medium' }
    }
    return { color: 'text-orange-700', bgColor: 'bg-orange-50', label: 'Low' }
  }

  const confidenceStyle = getConfidenceStyle(result.confidence)

  // Group data by category
  const groupedData = groupDataByCategory(result.data)

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Extraction Results
            </h2>
            <p className="text-sm text-gray-600">{filename}</p>
          </div>
          
          {/* Overall Confidence */}
          <div className={`px-3 py-1.5 rounded-lg ${confidenceStyle.bgColor}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${confidenceStyle.color}`}>
                {confidenceStyle.label} Confidence
              </span>
              <span className={`text-sm font-bold ${confidenceStyle.color}`}>
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings/Errors */}
      {((result.warnings && result.warnings.length > 0) || (result.errors && result.errors.length > 0)) && (
        <div className="px-6 py-4 space-y-2 bg-yellow-50 border-b border-yellow-100">
          {result.errors && result.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">{error}</span>
            </div>
          ))}
          {result.warnings && result.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-start gap-2 text-sm">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span className="text-yellow-700">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Extracted Data Sections */}
      <div className="divide-y divide-gray-200">
        {Object.entries(groupedData).map(([category, fields]) => (
          <DataSection
            key={category}
            category={category}
            fields={fields}
            isExpanded={expandedSections.has(category)}
            onToggle={() => toggleSection(category)}
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Metadata */}
      {showMetadata && result.metadata && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => toggleSection('metadata')}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 w-full"
          >
            {expandedSections.has('metadata') ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>Extraction Metadata</span>
          </button>
          
          {expandedSections.has('metadata') && (
            <div className="mt-3 space-y-2 text-xs text-gray-600">
              {result.metadata.extractor_used && (
                <div className="flex justify-between">
                  <span>Extractor:</span>
                  <span className="font-medium">{result.metadata.extractor_used}</span>
                </div>
              )}
              {result.metadata.document_type && (
                <div className="flex justify-between">
                  <span>Document Type:</span>
                  <span className="font-medium">{result.metadata.document_type}</span>
                </div>
              )}
              {result.metadata.extraction_date && (
                <div className="flex justify-between">
                  <span>Extracted:</span>
                  <span className="font-medium">
                    {new Date(result.metadata.extraction_date).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Data Section Component
interface DataSectionProps {
  category: string
  fields: Array<{ key: string; value: string | number | boolean; confidence?: number }>
  isExpanded: boolean
  onToggle: () => void
  onEdit?: (field: string, value: string) => void
}

function DataSection({ category, fields, isExpanded, onToggle, onEdit }: DataSectionProps) {
  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase()
    if (lower.includes('applicant') || lower.includes('contact')) return User
    if (lower.includes('policy') || lower.includes('coverage')) return FileText
    if (lower.includes('date') || lower.includes('period')) return Calendar
    if (lower.includes('financial') || lower.includes('premium')) return DollarSign
    if (lower.includes('location') || lower.includes('address')) return MapPin
    if (lower.includes('property') || lower.includes('building')) return Building2
    return FileText
  }

  const Icon = getCategoryIcon(category)

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            {formatCategoryName(category)}
          </h3>
          <span className="text-xs text-gray-500">
            ({fields.length} field{fields.length !== 1 ? 's' : ''})
          </span>
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 space-y-3">
          {fields.map((field) => (
            <DataField
              key={field.key}
              fieldKey={field.key}
              value={field.value}
              confidence={field.confidence}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Individual Data Field Component
interface DataFieldProps {
  fieldKey: string
  value: string | number | boolean
  confidence?: number
  onEdit?: (field: string, value: string) => void
}

function DataField({ fieldKey, value, confidence, onEdit }: DataFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))

  const handleSave = () => {
    if (onEdit) {
      onEdit(fieldKey, editValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(String(value))
    setIsEditing(false)
  }

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'text-green-600'
    if (conf >= 0.6) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-sm font-medium text-gray-700">
            {formatFieldName(fieldKey)}
          </label>
          {confidence !== undefined && (
            <span className={`text-xs font-semibold ${getConfidenceColor(confidence)}`}>
              {Math.round(confidence * 100)}%
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-900 flex-1">
              {formatValue(value)}
            </p>
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Compact variant for inline display
interface CompactExtractionResultsProps {
  result: ExtractionResult
  className?: string
}

export function CompactExtractionResults({
  result,
  className = '',
}: CompactExtractionResultsProps) {
  const fieldCount = Object.keys(result.data).length
  const confidenceStyle = result.confidence >= 0.8 
    ? 'text-green-600 bg-green-50' 
    : result.confidence >= 0.6 
    ? 'text-yellow-600 bg-yellow-50' 
    : 'text-orange-600 bg-orange-50'

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <CheckCircle2 className="w-4 h-4 text-green-500" />
      <span className="text-sm text-gray-700">
        {fieldCount} field{fieldCount !== 1 ? 's' : ''} extracted
      </span>
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${confidenceStyle}`}>
        {Math.round(result.confidence * 100)}%
      </span>
    </div>
  )
}

// Helper functions
function groupDataByCategory(data: Record<string, unknown>): Record<string, Array<{
  key: string
  value: string | number | boolean
  confidence?: number
}>> {
  const grouped: Record<string, Array<{
    key: string
    value: string | number | boolean
    confidence?: number
  }>> = {}

  // Define category patterns
  const categories: Record<string, RegExp[]> = {
    'Applicant Information': [/applicant/i, /name/i, /contact/i, /email/i, /phone/i],
    'Policy Details': [/policy/i, /coverage/i, /limit/i, /deductible/i],
    'Dates & Periods': [/date/i, /period/i, /effective/i, /expiration/i],
    'Financial Information': [/premium/i, /amount/i, /price/i, /cost/i, /fee/i],
    'Location Information': [/address/i, /location/i, /city/i, /state/i, /zip/i],
    'Property Details': [/property/i, /building/i, /structure/i, /construction/i],
  }

  // Categorize each field
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      // Skip nested objects for now
      continue
    }

    let assigned = false
    for (const [category, patterns] of Object.entries(categories)) {
      if (patterns.some(pattern => pattern.test(key))) {
        if (!grouped[category]) {
          grouped[category] = []
        }
        grouped[category].push({
          key,
          value: value as string | number | boolean,
        })
        assigned = true
        break
      }
    }

    // Default category
    if (!assigned) {
      if (!grouped['Other Information']) {
        grouped['Other Information'] = []
      }
      grouped['Other Information'].push({
        key,
        value: value as string | number | boolean,
      })
    }
  }

  return grouped
}

function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatFieldName(field: string): string {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}