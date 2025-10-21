/**
 * File selector component with checkboxes.
 */

'use client'

import { InputFile } from '@/types/folder'

interface FileSelectorProps {
  files: InputFile[]
  selectedFileIds: string[]
  onSelectAll: () => void
  onDeselectAll: () => void
  onToggleFile: (fileId: string) => void
}

export default function FileSelector({
  files,
  selectedFileIds,
  onSelectAll,
  onDeselectAll,
  onToggleFile,
}: FileSelectorProps) {
  const allSelected = files.length > 0 && selectedFileIds.length === files.length

  return (
    <div>
      {/* Select All Controls */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Select Files to Process</label>
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Select All
          </button>
          <span className="text-gray-300">•</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
        {files.map((file) => {
          const isSelected = selectedFileIds.includes(file.id)
          return (
            <label
              key={file.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleFile(file.id)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />

              {/* File Icon */}
              <span className="text-xl flex-shrink-0">📄</span>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  {file.confidence && (
                    <span className="text-xs text-green-600">
                      {Math.round(file.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              {file.status === 'ready' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded flex-shrink-0">
                  Ready
                </span>
              )}
            </label>
          )
        })}
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No files available to process</p>
        </div>
      )}
    </div>
  )
}