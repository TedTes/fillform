'use client'

import { X } from 'lucide-react'
import { ClassificationPreview } from './extraction'
import type { ClassificationResult } from '@/types/extraction'

interface ClassificationModalProps {
  isOpen: boolean
  onClose: () => void
  filename: string
  classification: ClassificationResult
  onConfirm: () => void
  onReject: () => void
}

export default function ClassificationModal({
  isOpen,
  onClose,
  filename,
  classification,
  onConfirm,
  onReject,
}: ClassificationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleReject = () => {
    onReject()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Classification
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <ClassificationPreview
            filename={filename}
            classification={classification}
            onConfirm={handleConfirm}
            onReject={handleReject}
            showActions={true}
          />
        </div>
      </div>
    </div>
  )
}