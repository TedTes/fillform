/**
 * Output files section - with enhanced empty states.
 */

'use client'

import { useState } from 'react'
import { OutputFile } from '@/types/folder'
import OutputFileCard from './OutputFileCard'
import CollapsibleList from './CollapsibleList'
import EmptyState from './EmptyState'

interface OutputFilesSectionProps {
  files: OutputFile[]
  hasInputFiles: boolean
  onGenerate: () => void
  onDownload: (fileId: string) => void
  onPreview: (fileId: string) => void
  onDelete: (fileId: string) => void
}

export default function OutputFilesSection({
  files,
  hasInputFiles,
  onGenerate,
  onDownload,
  onPreview,
  onDelete,
}: OutputFilesSectionProps) {
  const [showAll, setShowAll] = useState(false)

  const recentFiles = files.slice(0, 3)
  const olderFiles = files.slice(3)
  const hasOlderFiles = olderFiles.length > 0

  const displayedFiles = showAll ? files : recentFiles

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Output Files ({files.length})
        </h3>
        {hasInputFiles && files.length === 0 && (
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Output
          </button>
        )}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title={hasInputFiles ? 'No outputs generated yet' : 'Upload files first'}
          description={
            hasInputFiles
              ? 'Click "Generate Output" to create filled ACORD 126 PDFs from your input files.'
              : 'Upload input files before generating outputs.'
          }
          action={
            hasInputFiles
              ? {
                  label: 'Generate Output',
                  onClick: onGenerate,
                }
              : undefined
          }
        />
      ) : (
        <div>
          {/* File List */}
          <div className="space-y-3">
            {displayedFiles.map((file) => (
              <OutputFileCard
                key={file.id}
                file={file}
                onDownload={() => onDownload(file.id)}
                onPreview={() => onPreview(file.id)}
                onDelete={() => onDelete(file.id)}
              />
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasOlderFiles && (
            <CollapsibleList
              isExpanded={showAll}
              onToggle={() => setShowAll(!showAll)}
              hiddenCount={olderFiles.length}
            />
          )}
        </div>
      )}
    </section>
  )
}