'use client'

import { useState } from 'react'
import { mockFolders, getInputFilesForFolder, getOutputFilesForFolder } from '@/lib/mock-data'
import type { Folder } from '@/types/folder'
import FolderPanel from '@/components/FolderPanel'
import InputFilesSection from '@/components/InputFilesSection'
import OutputFilesSection from '@/components/OutputFilesSection'

export default function Home() {
  const [activeFolder, setActiveFolder] = useState<Folder>(mockFolders[0])

  const inputFiles = getInputFilesForFolder(activeFolder.id)
  const outputFiles = getOutputFilesForFolder(activeFolder.id)

  const handleNewFolder = () => {
    console.log('Create new folder')
    // Will be implemented in interaction commit
  }

  const handleUploadFiles = () => {
    console.log('Upload files')
    // Will be implemented in interaction commit
  }

  const handleRemoveFile = (fileId: string) => {
    console.log('Remove file:', fileId)
    // Will be implemented in interaction commit
  }

  const handleGenerateOutput = () => {
    console.log('Generate output')
    // Will be implemented in interaction commit
  }

  const handleDownloadOutput = (fileId: string) => {
    console.log('Download output:', fileId)
    // Will be implemented in interaction commit
  }

  const handlePreviewOutput = (fileId: string) => {
    console.log('Preview output:', fileId)
    // Will be implemented in interaction commit
  }

  const handleDeleteOutput = (fileId: string) => {
    console.log('Delete output:', fileId)
    // Will be implemented in interaction commit
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AutoFil</h1>
          <p className="text-sm text-gray-600">ACORD Form Filler</p>
        </div>
      </header>

      {/* Main Layout: Two Panels */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel: Folders */}
        <FolderPanel
          folders={mockFolders}
          activeFolder={activeFolder}
          onFolderClick={setActiveFolder}
          onNewFolder={handleNewFolder}
        />

        {/* Right Panel: Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Folder Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{activeFolder.name}</h2>
              <p className="text-sm text-gray-500">
                {inputFiles.length} input files • {outputFiles.length} output files
              </p>
            </div>

            {/* Input Files Section */}
            <InputFilesSection
              files={inputFiles}
              onUpload={handleUploadFiles}
              onRemove={handleRemoveFile}
            />

            {/* Output Files Section */}
            <OutputFilesSection
              files={outputFiles}
              hasInputFiles={inputFiles.length > 0}
              onGenerate={handleGenerateOutput}
              onDownload={handleDownloadOutput}
              onPreview={handlePreviewOutput}
              onDelete={handleDeleteOutput}
            />
          </div>
        </main>
      </div>
    </div>
  )
}