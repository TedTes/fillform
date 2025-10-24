'use client'

import { useState } from 'react'
import { OutputFile } from '@/types/folder'
import OutputFileCard from './OutputFileCard'
import CollapsibleList from './CollapsibleList'
import { Upload } from 'lucide-react' // used in empty state art

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
      {/* Content */}
      {!hasInputFiles ? (
        <div className="border-2 border-gray-200 rounded-xl p-12 text-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h4 className="text-base font-semibold text-gray-700 mb-2">
              Upload Files First
            </h4>
            <p className="text-sm text-gray-500">
              Upload input files to generate filled ACORD 126 PDFs
            </p>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="w-full border-2 border-dashed border-blue-300 rounded-xl p-12 bg-blue-25 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Generate Filled PDFs
            </h4>
            <p className="text-sm text-gray-500">
              Click to fill your ACORD 126 template with extracted data
            </p>
          </div>
        </div>
      ) : (
        <div>
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
