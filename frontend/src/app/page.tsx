'use client'

import { useState } from 'react'
import { mockFolders, mockInputFiles, mockOutputFiles } from '@/lib/mock-data'
import type { Folder, InputFile, OutputFile } from '@/types/folder'
import FolderPanel from '@/components/FolderPanel'
import InputFilesSection from '@/components/InputFilesSection'
import OutputFilesSection from '@/components/OutputFilesSection'
import GenerateModal from '@/components/GenerateModal'

export default function Home() {
  // State
  const [folders, setFolders] = useState<Folder[]>(mockFolders)
  const [activeFolder, setActiveFolder] = useState<Folder>(mockFolders[0])
  const [inputFiles, setInputFiles] = useState<InputFile[]>(mockInputFiles)
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>(mockOutputFiles)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)

  // Derived state
  const activeFolderInputs = inputFiles.filter((f) => f.folderId === activeFolder.id)
  const activeFolderOutputs = outputFiles.filter((f) => f.folderId === activeFolder.id)

  // Update folder file counts
  const updateFolderCounts = () => {
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        fileCount: inputFiles.filter((f) => f.folderId === folder.id).length,
      }))
    )
  }

  // Folder Actions
  const handleNewFolder = () => {
    const name = prompt('Enter folder name:')
    if (!name || name.trim() === '') return

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      fileCount: 0,
    }

    setFolders((prev) => [...prev, newFolder])
    setActiveFolder(newFolder)
    console.log('✅ Created folder:', name)
  }

  // File Upload Actions
  const handleUploadFiles = () => {
    // Simulate file upload
    const fileCount = Math.floor(Math.random() * 3) + 1 // 1-3 files
    const newFiles: InputFile[] = []

    for (let i = 0; i < fileCount; i++) {
      const newFile: InputFile = {
        id: `input-${Date.now()}-${i}`,
        folderId: activeFolder.id,
        filename: `uploaded_file_${Date.now()}_${i + 1}.pdf`,
        size: Math.floor(Math.random() * 3000000) + 1000000, // 1-4 MB
        status: 'uploading',
        uploadedAt: new Date().toISOString(),
      }
      newFiles.push(newFile)
    }

    setInputFiles((prev) => [...prev, ...newFiles])
    console.log(`✅ Uploading ${fileCount} file(s)...`)

    // Simulate upload progress
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        setInputFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'extracting' } : f
          )
        )

        // Then extracting -> ready
        setTimeout(() => {
          setInputFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: 'ready', confidence: Math.random() * 0.2 + 0.75 }
                : f
            )
          )
          console.log(`✅ File ready: ${file.filename}`)
        }, 1500)
      }, 1000 * (index + 1))
    })

    updateFolderCounts()
  }

  const handleRemoveFile = (fileId: string) => {
    const file = inputFiles.find((f) => f.id === fileId)
    if (!file) return

    const confirmed = confirm(`Remove ${file.filename}?`)
    if (!confirmed) return

    setInputFiles((prev) => prev.filter((f) => f.id !== fileId))
    
    // Also remove associated outputs
    setOutputFiles((prev) => prev.filter((f) => f.inputFileId !== fileId))
    
    console.log('✅ Removed file:', file.filename)
    updateFolderCounts()
  }

  // Generate Actions
  const handleGenerateOutput = () => {
    if (activeFolderInputs.length === 0) {
      alert('No input files to process')
      return
    }
    setIsGenerateModalOpen(true)
  }

  const handleGenerate = (selectedFileIds: string[]) => {
    console.log(`✅ Generating outputs for ${selectedFileIds.length} file(s)...`)

    // Create output files for selected inputs
    const newOutputs: OutputFile[] = selectedFileIds.map((inputFileId) => {
      const inputFile = inputFiles.find((f) => f.id === inputFileId)
      if (!inputFile) return null

      return {
        id: `output-${Date.now()}-${Math.random()}`,
        folderId: activeFolder.id,
        inputFileId: inputFile.id,
        inputFilename: inputFile.filename,
        filename: `ACORD_126_filled_${Date.now()}.pdf`,
        size: inputFile.size + Math.floor(Math.random() * 200000), // Slightly larger
        status: 'generating' as const,
        generatedAt: new Date().toISOString(),
      }
    }).filter(Boolean) as OutputFile[]

    setOutputFiles((prev) => [...prev, ...newOutputs])

    // Simulate generation completion
    setTimeout(() => {
      setOutputFiles((prev) =>
        prev.map((f) =>
          newOutputs.find((n) => n.id === f.id)
            ? {
                ...f,
                status: 'ready' as const,
                fieldsWritten: Math.floor(Math.random() * 20) + 110,
                fieldsSkipped: Math.floor(Math.random() * 10) + 3,
              }
            : f
        )
      )
      console.log('✅ Generation complete!')
    }, 3000)
  }

  // Output Actions
  const handleDownloadOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    console.log('📥 Downloading:', file.filename)
    alert(`Downloading: ${file.filename}\n\n(In production, this would download the actual PDF file)`)
  }

  const handlePreviewOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    console.log('👁️ Previewing:', file.filename)
    alert(`Preview: ${file.filename}\n\n(In production, this would open the PDF in a modal viewer)`)
  }

  const handleDeleteOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    const confirmed = confirm(`Delete ${file.filename}?`)
    if (!confirmed) return

    setOutputFiles((prev) => prev.filter((f) => f.id !== fileId))
    console.log('✅ Deleted output:', file.filename)
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
          folders={folders}
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
                {activeFolderInputs.length} input files • {activeFolderOutputs.length} output files
              </p>
            </div>

            {/* Input Files Section */}
            <InputFilesSection
              files={activeFolderInputs}
              onUpload={handleUploadFiles}
              onRemove={handleRemoveFile}
            />

            {/* Output Files Section */}
            <OutputFilesSection
              files={activeFolderOutputs}
              hasInputFiles={activeFolderInputs.length > 0}
              onGenerate={handleGenerateOutput}
              onDownload={handleDownloadOutput}
              onPreview={handlePreviewOutput}
              onDelete={handleDeleteOutput}
            />
          </div>
        </main>
      </div>

      {/* Generate Modal */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        files={activeFolderInputs.filter((f) => f.status === 'ready')}
        onGenerate={handleGenerate}
      />
    </div>
  )
}