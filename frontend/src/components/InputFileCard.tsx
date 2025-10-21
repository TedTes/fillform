/**
 * Single input file card component.
 */

'use client'

import { InputFile } from '@/types/folder'

interface InputFileCardProps {
  file: InputFile
  onRemove: () => void
}

export default function InputFileCard({ file, onRemove }: InputFileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <div className="flex-shrink-0">
          <span className="text-3xl">📄</span>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.filename}</p>
          
          <div className="flex items-center gap-3 mt-1.5">
            {/* File Size */}
            <span className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </span>

            {/* Status Badge */}
            <StatusBadge status={file.status} />

            {/* Confidence */}
            {file.confidence && file.status === 'ready' && (
              <span className="text-xs text-green-600 font-medium">
                ✓ {Math.round(file.confidence * 100)}% confidence
              </span>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove file"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: InputFile['status'] }) {
  const config = {
    uploading: {
      text: 'Uploading...',
      className: 'bg-blue-100 text-blue-700',
    },
    uploaded: {
      text: 'Uploaded',
      className: 'bg-gray-100 text-gray-700',
    },
    extracting: {
      text: 'Extracting...',
      className: 'bg-yellow-100 text-yellow-700',
    },
    ready: {
      text: 'Ready',
      className: 'bg-green-100 text-green-700',
    },
    error: {
      text: 'Error',
      className: 'bg-red-100 text-red-700',
    },
  }

  const { text, className } = config[status]

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${className}`}>
      {text}
    </span>
  )
}