/**
 * Generate modal 
 */

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { InputFile } from '@/types/folder'
import FileSelector from './FileSelector'
import ProgressBar from './ProgressBar'

interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
  files: InputFile[]
  onGenerate: (selectedFileIds: string[]) => void
}

export default function GenerateModal({
  isOpen,
  onClose,
  files,
  onGenerate,
}: GenerateModalProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  if (!isOpen) return null

  const handleSelectAll = () => {
    setSelectedFileIds(files.map((f) => f.id))
  }

  const handleDeselectAll = () => {
    setSelectedFileIds([])
  }

  const handleToggleFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleGenerate = () => {
    if (selectedFileIds.length === 0) return

    setIsGenerating(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          onGenerate(selectedFileIds)
          setTimeout(() => {
            setIsGenerating(false)
            setProgress(0)
            setSelectedFileIds([])
            onClose()
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">Generate Output Files</h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1 hidden sm:block">
                Select files to process and generate filled PDFs
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-3 lg:py-4">
            {!isGenerating ? (
              <>
                {/* Form Type Selector */}
                <div className="mb-4 lg:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Form Type
                  </label>
                  <select className="w-full px-3 lg:px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                    <option value="126">ACORD 126 - Commercial General Liability</option>
                    <option value="125" disabled>
                      ACORD 125 (Coming Soon)
                    </option>
                  </select>
                </div>

                {/* File Selection */}
                <FileSelector
                  files={files}
                  selectedFileIds={selectedFileIds}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onToggleFile={handleToggleFile}
                />
              </>
            ) : (
              <div className="py-6 lg:py-8">
                <ProgressBar progress={progress} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50">
            <p className="text-xs lg:text-sm text-gray-600 order-2 sm:order-1">
              {selectedFileIds.length} of {files.length} selected
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="flex-1 sm:flex-none px-4 py-2 text-sm lg:text-base text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={selectedFileIds.length === 0 || isGenerating}
                className="flex-1 sm:flex-none px-4 lg:px-6 py-2 text-sm lg:text-base bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Generating...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span className="hidden sm:inline">
                      Generate {selectedFileIds.length} {selectedFileIds.length === 1 ? 'File' : 'Files'}
                    </span>
                    <span className="sm:hidden">Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}