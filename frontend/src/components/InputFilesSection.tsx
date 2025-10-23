/**
 * Input files section - with integrated upload button/drop zone.
 */

'use client'

import { InputFile } from '@/types/folder'
import InputFileCard from './InputFileCard'
import { Upload } from 'lucide-react'

interface InputFilesSectionProps {
  files: InputFile[]
  onUpload: () => void
  onRemove: (fileId: string) => void
  onPreview: (fileId: string) => void
}

export default function InputFilesSection({
  files,
  onUpload,
  onRemove,
  onPreview,
}: InputFilesSectionProps) {
  return (
    <section className="mb-8">
      {/* Header with Upload Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Input Files</h3>
          <p className="text-sm text-gray-500 mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>

        {/* Upload Button - Only show if files exist */}
        {files.length > 0 && (
          <button
            onClick={onUpload}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        )}
      </div>

      {/* File List or Drop Zone */}
      {files.length === 0 ? (
        // Drop Zone - When Empty
        <button
          onClick={onUpload}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Upload ACORD 126 Files
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Click to browse or drag and drop your PDF files here
            </p>
            <div className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg group-hover:bg-blue-600 transition-colors">
              Browse Files
            </div>
          </div>
        </button>
      ) : (
        // File List - When Files Exist
        <div className="space-y-3">
          {files.map((file) => (
            <InputFileCard
              key={file.id}
              file={file}
              onRemove={() => onRemove(file.id)}
              onPreview={() => onPreview(file.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}