'use client'

import { useState } from 'react'
import { mockFolders, mockInputFiles, mockOutputFiles } from '@/lib/mock-data'
import type { Folder, InputFile, OutputFile } from '@/types/folder'
import FolderPanel from '@/components/FolderPanel'
import InputFilesSection from '@/components/InputFilesSection'
import OutputFilesSection from '@/components/OutputFilesSection'
import GenerateModal from '@/components/GenerateModal'
import useToast from '@/hooks/useToast'

export default function Home() {
  // Toast
  const toast = useToast()

  // State
  const [folders, setFolders] = useState<Folder[]>(mockFolders)
  const [activeFolder, setActiveFolder] = useState<Folder>(mockFolders[0])
  const [inputFiles, setInputFiles] = useState<InputFile[]>(mockInputFiles)
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>(mockOutputFiles)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    toast.success(`Folder "${name.trim()}" created successfully`)
    console.log('✅ Created folder:', name)
  }

  // File Upload Actions
  const handleUploadFiles = () => {
    const fileCount = Math.floor(Math.random() * 3) + 1
    const newFiles: InputFile[] = []

    for (let i = 0; i < fileCount; i++) {
      const newFile: InputFile = {
        id: `input-${Date.now()}-${i}`,
        folderId: activeFolder.id,
        filename: `uploaded_file_${Date.now()}_${i + 1}.pdf`,
        size: Math.floor(Math.random() * 3000000) + 1000000,
        status: 'uploading',
        uploadedAt: new Date().toISOString(),
      }
      newFiles.push(newFile)
    }

    setInputFiles((prev) => [...prev, ...newFiles])
    toast.info(`Uploading ${fileCount} file${fileCount > 1 ? 's' : ''}...`)
    console.log(`✅ Uploading ${fileCount} file(s)...`)

    newFiles.forEach((file, index) => {
      setTimeout(() => {
        setInputFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'extracting' } : f
          )
        )

        setTimeout(() => {
          setInputFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: 'ready', confidence: Math.random() * 0.2 + 0.75 }
                : f
            )
          )
          
          // Show success toast only for the last file
          if (index === newFiles.length - 1) {
            toast.success(`${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully`)
          }
          
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
    setOutputFiles((prev) => prev.filter((f) => f.inputFileId !== fileId))
    
    toast.info(`File "${file.filename}" removed`)
    console.log('✅ Removed file:', file.filename)
    updateFolderCounts()
  }

  // Generate Actions
  const handleGenerateOutput = () => {
    if (activeFolderInputs.length === 0) {
      toast.warning('No input files to process')
      return
    }
    setIsGenerateModalOpen(true)
  }

  const handleGenerate = (selectedFileIds: string[]) => {
    console.log(`✅ Generating outputs for ${selectedFileIds.length} file(s)...`)
    toast.info(`Generating ${selectedFileIds.length} output file${selectedFileIds.length > 1 ? 's' : ''}...`)

    const newOutputs: OutputFile[] = selectedFileIds.map((inputFileId) => {
      const inputFile = inputFiles.find((f) => f.id === inputFileId)
      if (!inputFile) return null

      return {
        id: `output-${Date.now()}-${Math.random()}`,
        folderId: activeFolder.id,
        inputFileId: inputFile.id,
        inputFilename: inputFile.filename,
        filename: `ACORD_126_filled_${Date.now()}.pdf`,
        size: inputFile.size + Math.floor(Math.random() * 200000),
        status: 'generating' as const,
        generatedAt: new Date().toISOString(),
      }
    }).filter(Boolean) as OutputFile[]

    setOutputFiles((prev) => [...prev, ...newOutputs])

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
      toast.success(`${selectedFileIds.length} output file${selectedFileIds.length > 1 ? 's' : ''} generated successfully`)
      console.log('✅ Generation complete!')
    }, 3000)
  }

  // Output Actions
  const handleDownloadOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    console.log('📥 Downloading:', file.filename)
    toast.success(`Downloading ${file.filename}`)
    
    // Simulate download
    setTimeout(() => {
      alert(`Downloading: ${file.filename}\n\n(In production, this would download the actual PDF file)`)
    }, 100)
  }

  const handlePreviewOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    console.log('👁️ Previewing:', file.filename)
    toast.info(`Opening preview for ${file.filename}`)
    
    setTimeout(() => {
      alert(`Preview: ${file.filename}\n\n(In production, this would open the PDF in a modal viewer)`)
    }, 100)
  }

  const handleDeleteOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    const confirmed = confirm(`Delete ${file.filename}?`)
    if (!confirmed) return

    setOutputFiles((prev) => prev.filter((f) => f.id !== fileId))
    toast.info(`Output file "${file.filename}" deleted`)
    console.log('✅ Deleted output:', file.filename)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 relative">
        <div className="px-6 py-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo & Title */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">AutoFil</h1>
              <p className="text-xs lg:text-sm text-gray-600">ACORD Form Filler</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Two Panels */}
      <div className="flex h-[calc(100vh-65px)] lg:h-[calc(100vh-80px)]">
        {/* Left Panel: Folders */}
        <FolderPanel
          folders={folders}
          activeFolder={activeFolder}
          onFolderClick={setActiveFolder}
          onNewFolder={handleNewFolder}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Panel: Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            {/* Folder Header */}
            <div className="mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">{activeFolder.name}</h2>
              <p className="text-xs lg:text-sm text-gray-500">
                {activeFolderInputs.length} input • {activeFolderOutputs.length} output
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