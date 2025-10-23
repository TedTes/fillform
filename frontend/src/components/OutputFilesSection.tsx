/**
 * Output files section - with integrated generate button.
 */

'use client'

import { useState } from 'react'
import { OutputFile } from '@/types/folder'
import OutputFileCard from './OutputFileCard'
import CollapsibleList from './CollapsibleList'
import { Zap } from 'lucide-react'

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
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Output Files</h3>
          <p className="text-sm text-gray-500 mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} generated
          </p>
        </div>

        {/* Generate Button - Only show if input files exist and outputs exist */}
        {hasInputFiles && files.length > 0 && (
          <button
            onClick={onGenerate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Generate More
          </button>
        )}
      </div>

      {/* Content */}
      {!hasInputFiles ? (
        // No Input Files - Show Message
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
        // Has Input Files but No Outputs - Show Generate
        <button
          onClick={onGenerate}
          className="w-full border-2 border-dashed border-blue-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group bg-blue-25"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Generate Filled PDFs
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Click to fill your ACORD 126 template with extracted data
            </p>
            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg group-hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Generate Output
            </div>
          </div>
        </button>
      ) : (
        // Has Output Files - Show List
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