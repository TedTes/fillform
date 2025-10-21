/**
 * Single output file card component.
 */

'use client'

import { OutputFile } from '@/types/folder'
import { Download, Eye, Trash2 } from 'lucide-react'

interface OutputFileCardProps {
  file: OutputFile
  onDownload: () => void
  onPreview: () => void
  onDelete: () => void
}

export default function OutputFileCard({
  file,
  onDownload,
  onPreview,
  onDelete,
}: OutputFileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center gap-3">
        {/* File Icon */}
        <div className="flex-shrink-0">
          <span className="text-3xl">📥</span>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{file.filename}</p>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* File Size */}
            <span className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </span>

            {/* Source Link */}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              from {file.inputFilename}
            </span>

            {/* Fields Info */}
            {file.fieldsWritten && (
              <span className="text-xs text-green-600 font-medium">
                {file.fieldsWritten} fields
              </span>
            )}

            {/* Status Badge */}
            <StatusBadge status={file.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onDownload}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onPreview}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Status badge component.
 */
function StatusBadge({ status }: { status: OutputFile['status'] }) {
  const config = {
    generating: {
      text: 'Generating...',
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