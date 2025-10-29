'use client'

import { useState } from 'react'
import { InputFile } from '@/types/folder'
import LoadingSpinner from './LoadingSpinner'
import { Eye, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react'
import { CompactDocumentBadge } from './extraction/DocumentTypeBadge'
import { CompactClassificationPreview } from './extraction/ClassificationPreview'
import type { ClassificationResult } from '@/types/extraction'
interface InputFileCardProps {
  file: InputFile
  onRemove: () => void
  onPreview: () => void
}

export default function InputFileCard({ file, onRemove, onPreview }: InputFileCardProps) {
  
  const [showDetails, setShowDetails] = useState(false)
  const isProcessing = file.status === 'uploading' || file.status === 'extracting'
  const classification: ClassificationResult | null = file.document_type && file.confidence
  ? {
      document_type: file.document_type,
      confidence: file.confidence,
      indicators: [],
    }
  : null

  return (
    <div className="group bg-white border-2 border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* File Icon or Loading */}
        <div className="flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
              isProcessing
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-gray-50 border-2 border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-200'
            }`}
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                className="w-7 h-7 text-gray-500 group-hover:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          {/* Filename with Document Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {file.filename}
            </p>
            
            {/* Document Type Badge */}
            {file.document_type && file.confidence !== undefined && file.confidence > 0 && (
              <CompactDocumentBadge 
                documentType={file.document_type}
                confidence={file.confidence}
              />
            )}

            {/* Show Details Button */}
            {classification && !isProcessing && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="Show classification details"
              >
                {showDetails ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Action Buttons or Processing State */}
          {!isProcessing ? (
            <div className="flex items-center gap-2 flex-wrap">
              <ActionChip
                icon={<Eye className="w-3.5 h-3.5" />}
                text="Preview"
                color="blue"
                onClick={onPreview}
              />
              <ActionChip
                icon={<Trash2 className="w-3.5 h-3.5" />}
                text="Delete"
                color="red"
                onClick={onRemove}
              />
              
              {/* Show confidence as text if available */}
              {file.confidence !== undefined && file.confidence > 0 && (
                <span className="text-xs text-gray-500">
                  {Math.round(file.confidence * 100)}% confidence
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-blue-600 font-medium">Processing...</p>
          )}
        </div>
      </div>
        {/* Expandable Classification Details */}
        {showDetails && classification && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CompactClassificationPreview classification={classification} />
        </div>
      )}
    </div>
  )
}

/**
 * Helper: Infer document type from InputFile
 * This maps the file status/name to a document type for the badge
 */
function getDocumentTypeFromFile(file: InputFile): string {
  //TODO:  If we have explicit document type from backend, use it

  const filename = file.filename.toLowerCase()
  
  if (filename.includes('acord') && filename.includes('126')) return 'acord_126'
  if (filename.includes('acord') && filename.includes('125')) return 'acord_125'
  if (filename.includes('acord') && filename.includes('130')) return 'acord_130'
  if (filename.includes('acord') && filename.includes('140')) return 'acord_140'
  if (filename.includes('loss') || filename.includes('claim')) return 'loss_run'
  if (filename.includes('sov') || filename.includes('schedule')) return 'sov'
  if (filename.includes('financial') || filename.includes('statement')) return 'financial_statement'
  if (filename.includes('supplement')) return 'supplemental'
  
  // Default to generic for PDFs, unknown for others
  return filename.endsWith('.pdf') ? 'generic' : 'unknown'
}

/** Small rounded "chip" style action button */
function ActionChip({
  icon,
  text,
  color,
  onClick,
}: {
  icon: React.ReactNode
  text: string
  color: 'blue' | 'red' | 'green'
  onClick: () => void
}) {
  const base = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
    red: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
    green: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
  }[color]

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-[9.5px] font-medium px-2 py-1 rounded-md transition-colors ${base}`}
    >
      {icon}
      {text}
    </button>
  )
}