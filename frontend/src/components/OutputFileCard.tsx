'use client'

import { OutputFile } from '@/types/folder'
import { Download, Eye, Trash2 } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

interface OutputFileCardProps {
  file: OutputFile
  onDownload: () => void
  onPreview: () => void
  onDelete: () => void
}

export default function OutputFileCard({ file, onDownload, onPreview, onDelete }: OutputFileCardProps) {
  const isGenerating = file.status === 'generating'

  return (
    <div className="group bg-white border-2 border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* File Icon or Loading */}
        <div className="flex-shrink-0">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-sm ${
              isGenerating
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-blue-50 border-2 border-blue-200 group-hover:bg-blue-100'
            }`}
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg
                className="w-7 h-7 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                  clipRule="evenodd"
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

          {!isGenerating ? (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ActionChip
                icon={<Eye className="w-3.5 h-3.5" />}
                text="Preview"
                color="blue"
                onClick={onPreview}
              />
              <ActionChip
                icon={<Download className="w-3.5 h-3.5" />}
                text="Download"
                color="green"
                onClick={onDownload}
              />
              <ActionChip
                icon={<Trash2 className="w-3.5 h-3.5" />}
                text="Delete"
                color="red"
                onClick={onDelete}
              />
            </div>
          ) : (
            <p className="text-xs text-blue-600 font-medium mt-2">Generating...</p>
          )}
        </div>
      </div>
    </div>
  )
}

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
      className={`inline-flex items-center  gap-1.5 text-[9.5px] font-small px-0.9 py-0.7  transition-colors ${base}`}
    >
      {icon}
      {text}
    </button>
  )
}
