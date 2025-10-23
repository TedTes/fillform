'use client'

import { useState ,useEffect} from 'react'
import type { Folder, InputFile, OutputFile } from '@/types'
import FolderPanel from '@/components/FolderPanel'
import InputFilesSection from '@/components/InputFilesSection'
import OutputFilesSection from '@/components/OutputFilesSection'
import GenerateModal from '@/components/GenerateModal'
import useToast from '@/hooks/useToast'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import { getInputPreviewUrl, getOutputPreviewUrl } from '@/lib/api-client'
import { 
  getFolders, 
  createFolder as apiCreateFolder,
  uploadPdfToFolder,
  batchFillPdfs,
  downloadPdf as apiDownloadPdf,
  getFolder,
  deleteSubmission
} from '@/lib/api-client'
export default function Home() {
  // Toast
  const toast = useToast()

  // State
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<Folder>()
  const [inputFiles, setInputFiles] = useState<InputFile[]>([])
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([])
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Derived state
  const activeFolderInputs = inputFiles.filter((f) => f.folder_id === activeFolder?.id)
  const activeFolderOutputs = outputFiles.filter((f) => f.folderId === activeFolder?.id)
  const [previewFile, setPreviewFile] = useState<{
    url: string
    filename: string
    type: 'input' | 'output'
  } | null>(null)
   // Load folders on mount
   useEffect(() => {
    loadFolders()
  }, [])
  useEffect(() => {
    if (activeFolder) {
      loadFolderSubmissions(activeFolder.folder_id)
    }
  }, [activeFolder])
  // Update folder file counts
  const updateFolderCounts = () => {
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        fileCount: inputFiles.filter((f) => f.folder_id === folder.id).length,
      }))
    )
  }
  const loadFolders = async () => {
    try {
      setIsLoading(true)
      const fetchedFolders = await getFolders()
     
      // Transform backend format to frontend format
      const transformedFolders = fetchedFolders.map(f => ({
        id: f.folder_id,
        folder_id:f.folder_id,
        name: f.name,
        created_at: f.created_at,
        file_count: f.file_count
      }))
      
      setFolders(transformedFolders)
      
      if (transformedFolders.length > 0) {
        setActiveFolder(transformedFolders[0])
      }
    } catch (error) {      
      console.error('Failed to load folders:', error)
      toast.error('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }
  const loadFolderSubmissions = async (folderId: string) => {
    try {
      const folder = await getFolder(folderId)

      // Transform submissions to InputFiles
      const inputs: InputFile[] = folder.submissions?.map((sub: any) => ({
        id: sub.submission_id,
        folder_id: folderId,
        filename: sub.filename,
        size: 2000000, // Default size, backend doesn't return this
        status: sub.status === 'filled'? 'filled': 'ready',
        uploadedAt: sub.uploaded_at,
        confidence: sub.confidence,
      })) || []
      
      setInputFiles(inputs)

      // Check for outputs (filled PDFs)
      const outputs: OutputFile[] = inputs
        .filter(input => {
          // Check if this submission has been filled
          return folder.submissions_detailed?.some((s: any) => 
            s.submission_id === input.id && s.status === 'filled'
          )
        })
        .map(input => ({
          id: input.id,
          folderId: folderId,
          inputFileId: input.id,
          inputFilename: input.filename,
          filename: `${input.filename.replace('.pdf', '')}_filled.pdf`,
          size: input.size + 100000,
          status: 'filled' as const ,
          generatedAt: input.uploadedAt,
        }))
      
      setOutputFiles(outputs)
      
    } catch (error) {
      console.error('Failed to load folder submissions:', error)
      // Don't show error toast - not critical
    }
  }
  // Folder Actions
  const handleNewFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name || name.trim() === '') return

    try {
      const newFolder = await apiCreateFolder(name.trim())
      
      const transformedFolder = {
        folder_id: newFolder.folder_id,
        name: newFolder.name,
        created_at: newFolder.created_at,
        file_count: 0
      }
      
      setFolders((prev) => [transformedFolder, ...prev])
      setActiveFolder(transformedFolder)
      toast.success(`Folder "${name.trim()}" created successfully`)
      console.log('✅ Created folder:', name)
    } catch (error) {
      console.error('Failed to create folder:', error)
      toast.error('Failed to create folder')
    }
  }

  // File Upload Actions
  const handleUploadFiles = async () => {
    if (!activeFolder) {
      toast.error('No active folder')
      return
    }

    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.multiple = true
    
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      const files = Array.from(target.files || [])
      
      if (files.length === 0) return
      
      toast.info(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`)
      
      for (const file of files) {
        try {
          // Create temporary input file entry
          const tempFile: InputFile = {
            id: `temp-${Date.now()}-${Math.random()}`,
            folder_id: activeFolder.folder_id,
            filename: file.name,
            size: file.size,
            status: 'uploading',
            uploadedAt: new Date().toISOString(),
          }
          
          setInputFiles((prev) => [...prev, tempFile])
          
          // Upload to backend
          const result = await uploadPdfToFolder(activeFolder.folder_id, file)
          
          // Update with real data
          setInputFiles((prev) =>
            prev.map((f) =>
              f.id === tempFile.id
                ? {
                    ...f,
                    id: result.submission_id,
                    status: 'ready',
                    confidence: result.extraction.confidence,
                  }
                : f
            )
          )
          
        } catch (error) {
          console.error('Upload failed:', error)
          toast.error(`Failed to upload ${file.name}`)
          
          // Remove failed upload
          setInputFiles((prev) => prev.filter((f) => f.filename !== file.name))
        }
      }
      
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`)
      
      // Reload folder to update counts
      loadFolders()
    }
    
    input.click()
  }

  const handleRemoveFile = async (fileId: string) => {
    const file = inputFiles.find((f) => f.id === fileId)
    if (!file) return

    const confirmed = confirm(`Remove ${file.filename}?`)
    if (!confirmed) return
    try {
      // Delete from backend first
      await deleteSubmission(fileId)
      setInputFiles((prev) => prev.filter((f) => f.id !== fileId))
      setOutputFiles((prev) => prev.filter((f) => f.inputFileId !== fileId))
      
      toast.info(`File "${file.filename}" removed`)
      console.log('✅ Removed file:', file.filename)
      updateFolderCounts()
    } catch(error) {
      console.error('Failed to delete file:', error)
      toast.error('Failed to delete file')
    }

  }

  // Generate Actions
  const handleGenerateOutput = () => {
    if (activeFolderInputs.length === 0) {
      toast.warning('No input files to process')
      return
    }
    setIsGenerateModalOpen(true)
  }

  const handleGenerate = async (selectedFileIds: string[]) => {
    try {
      toast.info(`Generating ${selectedFileIds.length} output file${selectedFileIds.length > 1 ? 's' : ''}...`)
      
      // Create placeholder outputs
      const newOutputs: OutputFile[] = selectedFileIds.map((inputFileId) => {
        const inputFile = inputFiles.find((f) => f.id === inputFileId)
        if (!inputFile) return null

        return {
          id: `generating-${Date.now()}-${Math.random()}`,
          folderId: activeFolder!.id,
          inputFileId: inputFile.id,
          inputFilename: inputFile.filename,
          filename: `ACORD_126_filled_${Date.now()}.pdf`,
          size: inputFile.size + 100000,
          status: 'generating' as const,
          generatedAt: new Date().toISOString(),
        }
      }).filter(Boolean) as OutputFile[]

      setOutputFiles((prev) => [...prev, ...newOutputs])
      
      // Call backend batch fill
      const results = await batchFillPdfs(selectedFileIds)
      
      // Update outputs with results
      setOutputFiles((prev) =>
        prev.map((output) => {
          const result = results.find(r => r.submission_id === output.inputFileId)
          if (result) {
            return {
              ...output,
              id: output.inputFileId, // Use submission_id as output id
              status: 'ready' as const,
              fieldsWritten: result.fill_report.written,
              fieldsSkipped: result.fill_report.skipped,
            }
          }
          return output
        })
      )
      
      toast.success(`${selectedFileIds.length} output file${selectedFileIds.length > 1 ? 's' : ''} generated successfully`)
      console.log('✅ Generation complete!')
      if (activeFolder) {
        await loadFolderSubmissions(activeFolder.folder_id)
      }
      
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate outputs')
      
      // Remove generating outputs
      setOutputFiles((prev) => prev.filter((f) => f.status !== 'generating'))
    }
  }

  // Output Actions
  const handleDownloadOutput = async (fileId: string) => {
    try {
      toast.success('Downloading file...')
      await apiDownloadPdf(fileId)
      console.log('📥 Downloaded:', fileId)
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    }
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
  const handlePreviewInput = (fileId: string) => {
    const file = inputFiles.find((f) => f.id === fileId)
    if (!file) return

    setPreviewFile({
      url: getInputPreviewUrl(fileId),
      filename: file.filename,
      type: 'input',
    })
  }

  const handlePreviewOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return

    setPreviewFile({
      url: getOutputPreviewUrl(fileId),
      filename: file.filename,
      type: 'output',
    })
  }

  const handleClosePreview = () => {
    setPreviewFile(null)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading folders...</p>
        </div>
      </div>
    )
  }
  if (!activeFolder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No folders available</p>
          <button
            onClick={handleNewFolder}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 relative">
        <div className="px-6 py-5 lg:px-8">
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

            {/* Logo & Title - with spacing */}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">AutoFil</h1>
              <p className="text-xs lg:text-sm text-gray-600">ACORD Form Filler</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Two Panels */}
      <div className="flex h-[calc(100vh-73px)] lg:h-[calc(100vh-89px)]">
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
        <main className="flex-1 overflow-y-auto w-full bg-gray-50">
          <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Folder Header */}
            <div className="mb-8 pb-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{activeFolder.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {activeFolderInputs.length} input • {activeFolderOutputs.length} output
                  </p>
                </div>
                
                {/* Quick Actions - ONLY ONE UPLOAD BUTTON */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleUploadFiles}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Files
                  </button>
                  
                  {activeFolderInputs.length > 0 && (
                    <button
                      onClick={handleGenerateOutput}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Output
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Input Files Section */}
            <InputFilesSection
              files={activeFolderInputs}
              onUpload={handleUploadFiles}
              onRemove={handleRemoveFile}
              onPreview={handlePreviewInput}
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

      {/* Modals */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        files={activeFolderInputs.filter((f) => f.status === 'ready')}
        onGenerate={handleGenerate}
      />

      {previewFile && (
        <PdfPreviewModal
          isOpen={!!previewFile}
          onClose={handleClosePreview}
          fileUrl={previewFile.url}
          filename={previewFile.filename}
          onDownload={
            previewFile.type === 'output'
              ? () => handleDownloadOutput(previewFile.url.split('/').pop() || '')
              : undefined
          }
        />
      )}
    </div>
  )

}