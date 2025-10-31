'use client'

import { useState } from 'react'
import { InputFile } from '@/types/folder'
import LoadingSpinner from './LoadingSpinner'
import { Eye, Trash2, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { CompactDocumentBadge } from './extraction/DocumentTypeBadge'
import { CompactClassificationPreview } from './extraction/ClassificationPreview'
import type { ClassificationResult } from '@/types/extraction'

interface InputFileCardProps {
  file: InputFile
  onRemove: () => void
  onPreview: () => void
  onViewExtraction?: () => void
}

export default function InputFileCard({ file, onRemove, onPreview, onViewExtraction }: InputFileCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const isProcessing = file.status === 'uploading' || file.status === 'extracting'
  
  const classification: ClassificationResult | null = file.document_type && file.confidence
    ? {
        document_type: file.document_type,
        confidence: file.confidence,
        indicators: [],
      }
    : null

  // Progress state (if available from file)
  const progress = (file).progress || 0
  const progressMessage = (file).progressMessage || getDefaultProgressMessage(file.status)

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
            {file.document_type && file.confidence !== undefined && file.confidence > 0 && !isProcessing && (
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

          {/* Progress Bar (shown during processing) */}
          {isProcessing && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-600">{progressMessage}</span>
                <span className="text-xs font-semibold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons or Processing State */}
          {!isProcessing ? (
            <div className="flex items-center gap-2 flex-wrap">
              <ActionChip
                icon={<Eye className="w-3.5 h-3.5" />}
                text="Preview"
                color="blue"
                onClick={onPreview}
              />
              {file.status === 'ready' && onViewExtraction && (
                <ActionChip
                  icon={<FileText className="w-3.5 h-3.5" />}
                  text="View Data"
                  color="green"
                  onClick={onViewExtraction}
                />
              )}
              <ActionChip
                icon={<Trash2 className="w-3.5 h-3.5" />}
                text="Delete"
                color="red"
                onClick={onRemove}
              />
              
              {/* Confidence Badge */}
              {file.confidence !== undefined && file.confidence > 0 && (
                <ConfidenceBadge confidence={file.confidence} />
              )}
            </div>
          ) : null}
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

/** Helper: Get default progress message based on status */
function getDefaultProgressMessage(status: string): string {
  switch (status) {
    case 'uploading':
      return 'Uploading file...'
    case 'extracting':
      return 'Extracting data...'
    default:
      return 'Processing...'
  }
}

/** Confidence Badge Component */
function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100)
  const colorClass = 
    percentage >= 90 ? 'text-green-600 bg-green-50 border-green-200' :
    percentage >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
    percentage >= 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    'text-orange-600 bg-orange-50 border-orange-200'

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${colorClass}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>{percentage}%</span>
    </div>
  )
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
      className={`inline-flex items-center gap-1.5 text-[9.5px] font-medium px-2 py-1 rounded-md transition-colors border ${base}`}
    >
      {icon}
      {text}
    </button>
  )
}