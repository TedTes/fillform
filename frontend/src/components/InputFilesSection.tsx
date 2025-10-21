/**
 * Input files section - top section of right panel.
 */

'use client'

import { InputFile } from '@/types/folder'
import InputFileCard from './InputFileCard'
import FileUploadButton from './FileUploadButton'

interface InputFilesSectionProps {
  files: InputFile[]
  onUpload: () => void
  onRemove: (fileId: string) => void
}

export default function InputFilesSection({
  files,
  onUpload,
  onRemove,
}: InputFilesSectionProps) {
  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Input Files ({files.length})
        </h3>
        <FileUploadButton onClick={onUpload} />
      </div>

      {/* File List or Empty State */}
      {files.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-500 font-medium">No files uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Click "Upload Files" to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <InputFileCard
              key={file.id}
              file={file}
              onRemove={() => onRemove(file.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}