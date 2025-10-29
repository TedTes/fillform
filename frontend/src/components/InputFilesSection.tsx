'use client'

import { InputFile } from '@/types/folder'
import InputFileCard from './InputFileCard'
import { Upload } from 'lucide-react' // (still used in empty-state art)

interface InputFilesSectionProps {
  files: InputFile[]
  onUpload: () => void
  onRemove: (fileId: string) => void
  onPreview: (fileId: string) => void
  onViewExtraction?: (fileId: string) => void
}

export default function InputFilesSection({
  files,
  onUpload,
  onRemove,
  onPreview,
  onViewExtraction,
}: InputFilesSectionProps) {
  return (
    <section className="mb-6">
      {/* File List or Drop Zone */}
      {files.length === 0 ? (
        // Empty state drop zone
        <button
          onClick={onUpload}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Upload ACORD 126 Files
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Click to browse or drag and drop your PDF files here
            </p>
            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg group-hover:bg-blue-700 transition-colors">
              Browse Files
            </div>
          </div>
        </button>
      ) : (
        // List when files exist
        <div className="space-y-3">
          {files.map((file) => (
            <InputFileCard
              key={file.id}
              file={file}
              onRemove={() => onRemove(file.id)}
              onPreview={() => onPreview(file.id)}
              onViewExtraction={onViewExtraction ? () => onViewExtraction(file.id) : undefined}
            />
          ))}
        </div>
      )}
    </section>
  )
}
