'use client'

import { InputFile } from '@/types/folder'
import LoadingSpinner from './LoadingSpinner'
import { Eye, Trash2 } from 'lucide-react'

interface InputFileCardProps {
  file: InputFile
  onRemove: () => void
  onPreview: () => void
}

export default function InputFileCard({ file, onRemove, onPreview }: InputFileCardProps) {
  const isProcessing = file.status === 'uploading' || file.status === 'extracting'

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
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-900 transition-colors">
            {file.filename}
          </p>

          {/* Action Buttons */}
          {!isProcessing && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
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
            </div>
          )}

          {isProcessing && (
            <p className="text-xs text-blue-600 font-medium mt-2">Processing...</p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Small rounded “chip” style action button */
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
      className={`inline-flex items-center gap-1.5 text-[9.5px] font-small px-0.8 py-0.7 rounded-md  transition-colors ${base}`}
    >
      {icon}
      {text}
    </button>
  )
}
