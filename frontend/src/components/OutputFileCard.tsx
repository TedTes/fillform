/**
 * Single output file card component
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
    <div className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* File Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
            <span className="text-2xl">📥</span>
          </div>
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate group-hover:text-gray-950 transition-colors">
            {file.filename}
          </p>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* File Size */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </span>

            {/* Source Link */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {file.inputFilename}
            </span>

            {/* Fields Info */}
            {file.fieldsWritten && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {file.fieldsWritten} fields
              </span>
            )}

            {/* Status Badge */}
            <StatusBadge status={file.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onDownload}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Download"
          >
            <Download className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
          <button
            onClick={onPreview}
            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Preview"
          >
            <Eye className="w-4.5 h-4.5" strokeWidth={2.5} />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Delete"
          >
            <Trash2 className="w-4.5 h-4.5" strokeWidth={2.5} />
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
      text: 'Generating',
      icon: '⚙️',
      className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    },
    ready: {
      text: 'Ready',
      icon: '✓',
      className: 'bg-green-50 text-green-700 border border-green-200',
    },
    error: {
      text: 'Error',
      icon: '⚠️',
      className: 'bg-red-50 text-red-700 border border-red-200',
    },
  }

  const { text, icon, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${className}`}>
      <span className="text-xs">{icon}</span>
      {text}
    </span>
  )
}