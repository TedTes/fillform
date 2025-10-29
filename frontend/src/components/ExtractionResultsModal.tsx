'use client'

import { X, Download, Edit } from 'lucide-react'
import { ExtractionResults } from './extraction'
import type { ExtractionResult } from '@/types/extraction'

interface ExtractionResultsModalProps {
  isOpen: boolean
  onClose: () => void
  filename: string
  result: ExtractionResult
  onEdit?: (field: string, value: string) => void
  onProceed?: () => void
  onDownload?: () => void
}

export default function ExtractionResultsModal({
  isOpen,
  onClose,
  filename,
  result,
  onEdit,
  onProceed,
  onDownload,
}: ExtractionResultsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-gray-900">
            Review Extracted Data
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <ExtractionResults
            result={result}
            filename={filename}
            onEdit={onEdit}
            showMetadata={true}
          />
        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download JSON
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onProceed && (
              <button
                onClick={() => {
                  onProceed()
                  onClose()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed to Fill
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}