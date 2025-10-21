/**
 * Input files section - with enhanced empty state.
 */

'use client'

import { InputFile } from '@/types/folder'
import InputFileCard from './InputFileCard'
import FileUploadButton from './FileUploadButton'
import EmptyState from './EmptyState'

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
        <EmptyState
          icon={
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          }
          title="No files uploaded yet"
          description="Upload ACORD 126 PDF files to get started. You can drag and drop or click the upload button."
          action={{
            label: 'Upload Files',
            onClick: onUpload,
          }}
        />
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