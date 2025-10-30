'use client'

import { useState, useEffect } from 'react'
import { Upload as UpIcon, Download as DownIcon } from 'lucide-react'

import { useRouter } from 'next/navigation'
import type { Folder, InputFile, OutputFile,Client,Submission } from '@/types'
import type { ClassificationResult } from '@/types/extraction'
import ClassificationModal from '@/components/ClassificationModal'
import FolderPanel from '@/components/FolderPanel'
import InputFilesSection from '@/components/InputFilesSection'
import OutputFilesSection from '@/components/OutputFilesSection'
import GenerateModal from '@/components/GenerateModal'
import useToast from '@/hooks/useToast'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import SubmissionTemplateModal from '@/components/SubmissionTemplateModal'
import { getInputPreviewUrl, getOutputPreviewUrl } from '@/lib/api-client'

import {
  getFolders,
  createFolder as apiCreateFolder,
  uploadPdfToFolder,
  batchFillPdfs,
  downloadPdf as apiDownloadPdf,
  getFolder,
  deleteSubmission,

  deleteFolder as apiDeleteFolder,
  renameFolder as apiRenameFolder,
  classifyDocument,
} from '@/lib/api-client'

export default function Home() {
  const toast = useToast()
  const router = useRouter()

  // ---------- State ----------
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null)
  const [inputFiles, setInputFiles] = useState<InputFile[]>([])
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([])
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClientName, setSelectedClientName] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null)

  const [classificationModal, setClassificationModal] = useState<{
    isOpen: boolean
    filename: string
    fileId: string
    classification: ClassificationResult | null
  }>({
    isOpen: false,
    filename: '',
    fileId: '',
    classification: null,
  })

    // Fetch clients on mount
    useEffect(() => {
      fetchClients()
      loadFolders()
    }, [])


    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients')
        const data = await res.json()
        if (data.success) {
          setClients(data.clients)
          // Auto-select first submission if available
          if (data.clients.length > 0 && data.clients[0].submissions_detailed?.length > 0) {
            const firstSub = data.clients[0].submissions_detailed[0]
            setActiveSubmission(firstSub)
            // Map submission to folder format for existing code
            setActiveFolder({
              folder_id: firstSub.submission_id,
              name: firstSub.name,
              created_at: firstSub.created_at,
              file_count: firstSub.file_count,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error)
      }
    }
    const handleSubmissionClick = (submission: Submission) => {
      setActiveSubmission(submission)
      // Map submission to folder format for existing code compatibility
      setActiveFolder({
        folder_id: submission.submission_id,
        name: submission.name,
        created_at: submission.created_at,
        file_count: submission.file_count,
      })
    }

    const handleNewClient = async () => {
      const name = prompt('Enter client name:')
      if (!name?.trim()) return
    
      try {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() }),
        })
        const data = await res.json()
        if (data.success) {
          await fetchClients()
          toast.success(`Client "${name}" created`)
        }
      } catch (error) {
        console.error('Failed to create client:', error)
        toast.error('Failed to create client')
      }
    }
const handleNewSubmission = (clientId: string) => {
  const client = clients.find(c => c.client_id === clientId)
  setSelectedClientId(clientId)
  setSelectedClientName(client?.name || 'Client')
  setIsTemplateModalOpen(true)
}
const handleCreateSubmissionWithTemplate = async (
  name: string,
  templateType: string
) => {
  if (!selectedClientId) return

  try {
    const res = await fetch(`/api/clients/${selectedClientId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        template_type: templateType
      }),
    })
    const data = await res.json()
    if (data.success) {
      await fetchClients()
      setActiveSubmission(data.submission)
      // Map to folder for compatibility
      setActiveFolder({
        folder_id: data.submission.submission_id,
        name: data.submission.name,
        created_at: data.submission.created_at,
        file_count: data.submission.file_count,
      })
      toast.success(`Submission "${name}" created`)
    }
  } catch (error) {
    console.error('Failed to create submission:', error)
    toast.error('Failed to create submission')
  }
}

  // Derived 
  const activeFolderId = activeFolder?.folder_id
  const activeFolderInputs = inputFiles.filter((f) => f.folder_id === activeFolderId)
  const activeFolderOutputs = outputFiles.filter((f) => f.folderId === activeFolderId)

  const [previewFile, setPreviewFile] = useState<{
    url: string
    filename: string
    type: 'input' | 'output'
  } | null>(null)

  // ---------- Effects ----------
  useEffect(() => {
    loadFolders()
  }, [])

  useEffect(() => {
    if (activeFolderId) {
      loadFolderSubmissions(activeFolderId)
    } else {
      setInputFiles([])
      setOutputFiles([])
    }
  }, [activeFolderId])

  // ---------- Helpers ----------
  const updateFolderCounts = () => {
    setFolders((prev) =>
      prev.map((folder) => ({
        ...folder,
        // backend uses file_count
        file_count: inputFiles.filter((f) => f.folder_id === folder.folder_id).length,
      }))
    )
  }

  const loadFolders = async () => {
    try {
      setIsLoading(true)
      const fetched = await getFolders()

      // normalize
      const transformed = fetched.map((f) => ({
        id: f.folder_id,
        folder_id: f.folder_id, 
        name: f.name,
        created_at: f.created_at,
        file_count: f.file_count ?? 0,
      }))

      setFolders(transformed)
      if (transformed.length > 0) {
     
        setActiveFolder((cur) => {
          if (!cur) return transformed[0]
          const still = transformed.find((x) => x.folder_id === cur.folder_id)
          return still ?? transformed[0]
        })
      } else {
        setActiveFolder(null)
      }
    } catch (err) {
      console.error('Failed to load folders:', err)
      toast.error('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFolderSubmissions = async (folderId: string) => {
    try {
      const folder = await getFolder(folderId)
      const inputs: InputFile[] =
        folder.submissions?.map((sub) => ({
          id: sub.submission_id,
          folder_id: folderId,
          filename: sub.filename,
          size: 2000000,
          status: sub.status === 'filled' ? 'filled' : 'ready',
          uploadedAt: sub.uploaded_at,
          confidence: sub.confidence
        })) ?? []

      setInputFiles(inputs)

      const outputs: OutputFile[] = inputs
        .filter((input) =>
          folder.submissions_detailed?.some(
            (s) => s.submission_id === input.id && s.status === 'filled'
          )
        )
        .map((input) => ({
          id: input.id, // align id with submission_id for ready outputs
          folderId: folderId,
          inputFileId: input.id,
          inputFilename: input.filename,
          filename: `${input.filename.replace('.pdf', '')}_filled.pdf`,
          size: input.size + 100000,
          status: 'filled' as const,
          generatedAt: input.uploadedAt,
        }))

      setOutputFiles(outputs)
    } catch (err) {
      console.error('Failed to load folder submissions:', err)
      // non-fatal
    }
  }

  // ---------- Folder Actions ----------
  const handleNewFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name || name.trim() === '') return
    const clean = name.trim()

    try {
      const newFolder = await apiCreateFolder(clean)
      const transformed = {
        id: newFolder.folder_id,
        folder_id: newFolder.folder_id,
        name: newFolder.name,
        created_at: newFolder.created_at,
        file_count: 0,
      }
      setFolders((prev) => [transformed, ...prev])
      setActiveFolder(transformed)
      toast.success(`Folder "${clean}" created successfully`)
    } catch (err) {
      console.error('Failed to create folder:', err)
      toast.error('Failed to create folder')
    }
  }

  const handleRename = async (folderId: string, newName: string) => {
    const clean = newName.trim()
    if (!clean) return
    // optimistic
    const prev = folders
    setFolders((p) => p.map((f) => (f.folder_id === folderId ? { ...f, name: clean } : f)))
    if (activeFolderId === folderId) {
      setActiveFolder((cur) => (cur ? { ...cur, name: clean } : cur))
    }
    try {
      const updated = await apiRenameFolder(folderId, clean)
      // reconcile with server response (in case of normalization)
      setFolders((p) => p.map((f) => (f.folder_id === folderId ? { ...f, ...updated, id: updated.folder_id } : f)))
      if (activeFolderId === folderId) {
        setActiveFolder((cur) => (cur ? { ...cur, ...updated, id: updated.folder_id } : cur))
      }
      toast.success('Folder renamed')
    } catch (err) {
      // rollback
      setFolders(prev)
      toast.error('Failed to rename folder')
    }
  }
  const handleViewExtraction = (fileId: string) => {
    const file = inputFiles.find(f => f.id === fileId)
    if (!file) return
    
    // TODO: Show extraction results modal
    toast.info(`Viewing extraction for ${file.filename}`)
    // For now, just show a toast. Later you can:
    // 1. Fetch extraction data from backend
    // 2. Show ExtractionResultsModal
  }
  const handleDelete = async (folderId: string) => {
    const prev = folders
    const next = prev.filter((f) => f.folder_id !== folderId)
    // optimistic
    setFolders(next)
    if (activeFolderId === folderId) {
      setActiveFolder(next[0] ?? null)
      setInputFiles([])
      setOutputFiles([])
    }
    try {
      await apiDeleteFolder(folderId)
      toast.info('Folder deleted')
    } catch (err) {
      // rollback
      setFolders(prev)
      // restore active if needed
      if (activeFolderId === folderId) {
        const restored = prev.find((f) => f.folder_id === folderId) ?? null
        setActiveFolder(restored)
      }
      toast.error('Failed to delete folder')
    }
  }

  // ---------- File Upload ----------
  const handleUploadFiles = async () => {
    if (!activeFolderId) {
      toast.error('No active folder')
      return
    }
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
          // Create temp entry
          const temp: InputFile = {
            id: `temp-${Date.now()}-${Math.random()}`,
            folder_id: activeFolderId,
            filename: file.name,
            size: file.size,
            status: 'uploading',
            uploadedAt: new Date().toISOString(),
          }
          setInputFiles((prev) => [...prev, temp])

          // Upload with auto-classify
          const result = await uploadPdfToFolder(activeFolderId, file)

          // Update file status
          setInputFiles((prev) =>
            prev.map((f) =>
              f.id === temp.id
                ? {
                    ...f,
                    id: result.submission_id,
                    status: 'ready',
                    confidence: result.extraction.confidence,
                  }
                : f
            )
          )

         
          if (result.submission_id) {
            try {
              const classification = await classifyDocument(result.submission_id)
              
              // Show classification modal
              setClassificationModal({
                isOpen: true,
                filename: file.name,
                fileId: result.submission_id,
                classification,
              })
            } catch (err) {
              console.warn('Classification failed:', err)
              // Continue without classification
            }
          }

        } catch (err) {
          console.error('Upload failed:', err)
          toast.error(`Failed to upload ${file.name}`)
          setInputFiles((prev) => prev.filter((f) => f.filename !== file.name))
        }
      }

      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`)
      loadFolders()
    }

    input.click()
  }

  const handleConfirmClassification = () => {
    const { fileId, classification } = classificationModal
    
    // Update file with classification data
    setInputFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              document_type: classification?.document_type,
              confidence: classification?.confidence,
            }
          : f
      )
    )

    toast.success('Classification confirmed')
  }
  const handleRejectClassification = () => {
    const { fileId, filename } = classificationModal
    
    toast.warning(`Classification rejected for ${filename}`)
    
    // Optionally: mark file for manual classification
    // or trigger re-classification
  }
  const handleCloseClassificationModal = () => {
    setClassificationModal({
      isOpen: false,
      filename: '',
      fileId: '',
      classification: null,
    })
  }
  // ---------- Input file actions ----------
  const handleRemoveFile = async (fileId: string) => {
    const file = inputFiles.find((f) => f.id === fileId)
    if (!file) return

    if (!confirm(`Remove ${file.filename}?`)) return
    try {
      await deleteSubmission(fileId)
      setInputFiles((prev) => prev.filter((f) => f.id !== fileId))
      setOutputFiles((prev) => prev.filter((f) => f.inputFileId !== fileId))
      toast.info(`File "${file.filename}" removed`)
      updateFolderCounts()
    } catch (err) {
      console.error('Failed to delete file:', err)
      toast.error('Failed to delete file')
    }
  }

  // ---------- Generate ----------
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

      const newOutputs: OutputFile[] = selectedFileIds
        .map((inputFileId) => {
          const inputFile = inputFiles.find((f) => f.id === inputFileId)
          if (!inputFile || !activeFolderId) return null
          return {
            id: `generating-${Date.now()}-${Math.random()}`,
            folderId: activeFolderId,
            inputFileId: inputFile.id,
            inputFilename: inputFile.filename,
            filename: `ACORD_126_filled_${Date.now()}.pdf`,
            size: inputFile.size + 100000,
            status: 'generating' as const,
            generatedAt: new Date().toISOString(),
          }
        })
        .filter(Boolean) as OutputFile[]

      setOutputFiles((prev) => [...prev, ...newOutputs])

      const results = await batchFillPdfs(selectedFileIds)

      setOutputFiles((prev) =>
        prev.map((output) => {
          const result = results.find((r) => r.submission_id === output.inputFileId)
          return result
            ? {
                ...output,
                id: output.inputFileId,
                status: 'ready' as const,
                fieldsWritten: result.fill_report.written,
                fieldsSkipped: result.fill_report.skipped,
              }
            : output
        })
      )

      toast.success(`${selectedFileIds.length} output file${selectedFileIds.length > 1 ? 's' : ''} generated successfully`)
      if (activeFolderId) await loadFolderSubmissions(activeFolderId)
    } catch (err) {
      console.error('Generation failed:', err)
      toast.error('Failed to generate outputs')
      setOutputFiles((prev) => prev.filter((f) => f.status !== 'generating'))
    }
  }

  // ---------- Output actions ----------
  const handleDownloadOutput = async (fileId: string) => {
    try {
      toast.success('Downloading file...')
      await apiDownloadPdf(fileId)
    } catch (err) {
      console.error('Download failed:', err)
      toast.error('Failed to download file')
    }
  }

  const handleDeleteOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return
    if (!confirm(`Delete ${file.filename}?`)) return
    setOutputFiles((prev) => prev.filter((f) => f.id !== fileId))
    toast.info(`Output file "${file.filename}" deleted`)
  }

  // ---------- Preview ----------
  const handlePreviewInput = (fileId: string) => {
    const file = inputFiles.find((f) => f.id === fileId)
    if (!file) return
    setPreviewFile({ url: getInputPreviewUrl(fileId), filename: file.filename, type: 'input' })
  }

  const handlePreviewOutput = (fileId: string) => {
    const file = outputFiles.find((f) => f.id === fileId)
    if (!file) return
    setPreviewFile({ url: getOutputPreviewUrl(fileId), filename: file.filename, type: 'output' })
  }

  const handleClosePreview = () => setPreviewFile(null)

  // ---------- Nav ----------
  const handleGetStarted = () => router.push('/dashboard')
  const handleLogoClick = () => router.push('/landing')

  // ---------- Render ----------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading folders...</p>
        </div>
      </div>
    )
  }

  if (!activeFolder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 ml-1">
        <div className="px-4 lg:px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 lg:gap-3">
              <div className="relative">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-left">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight leading-none">AutoFil</h1>
                <p className="text-[10px] lg:text-xs text-gray-500 leading-tight mt-0.5">ACORD Form Filler</p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex h-[calc(100vh-73px)] lg:h-[calc(100vh-89px)] ml-10 mt-8">
        {/* Left Panel */}
        <FolderPanel
  clients={clients}
  activeSubmission={activeSubmission}
  onSubmissionClick={handleSubmissionClick}
  onNewClient={handleNewClient}
  onNewSubmission={handleNewSubmission}
  isMobileOpen={isMobileMenuOpen}
  onMobileToggle={() => setIsMobileMenuOpen(false)}
/>

        {/* Right Panel */}
        <main className="flex-1 overflow-y-auto w-full ml-3">
          <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Folder Header */}
   
            <div className="flex items-center justify-between mb-6">
  <div>
    <h3 className="text-xl text-gray-800">{activeFolder?.name}</h3>
    <p className="text-sm text-gray-500 mt-1">
      {activeFolderInputs.length} input • {activeFolderOutputs.length} output
    </p>
  </div>
  
  {/* ADD THIS BUTTON */}
  <button
    onClick={() => router.push('/extraction')}
    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
  >
    <UpIcon className="w-4 h-4" />
    Advanced Extraction
  </button>
</div>
      

            {/* Input Files */}
            <InputFilesSection
  files={activeFolderInputs}
  onUpload={handleUploadFiles}
  onRemove={handleRemoveFile}
  onPreview={handlePreviewInput}
  onViewExtraction={handleViewExtraction}
/>
{/* Toolbar under uploaded files */}
<div className="mt-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
  {/* Upload Files (⬆️ up arrow) */}
  <button
    onClick={handleUploadFiles}
    className="inline-flex h-7 items-center gap-1 rounded-md border-[0.6px] border-blue-400 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors w-full sm:w-auto"
  >
    <UpIcon className="w-3.5 h-3.5" aria-hidden="true" />
    <span>Upload Files</span>
  </button>

  {/* Generate New (⬇️ down arrow) */}
  <button
    onClick={handleGenerateOutput}
    disabled={activeFolderInputs.length === 0}
    className={`inline-flex h-7  items-center gap-1 rounded-md border-[0.6px] border-blue-400 px-2 py-1 text-xs font-semibold transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-offset-1
      ${
        activeFolderInputs.length === 0
          ? 'border-blue-200 text-blue-300 cursor-not-allowed'
          : 'border-[0.6px] border-blue-400 text-blue-700 hover:bg-blue-50 focus:ring-blue-500'
      }`}
  >
    <DownIcon className="w-3.5 h-3.5" aria-hidden="true" />
    <span>Generate New</span>
  </button>
</div>


            {/* Output Files */}
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

        {/*  Classification Modal */}
        {classificationModal.classification && (
        <ClassificationModal
          isOpen={classificationModal.isOpen}
          onClose={handleCloseClassificationModal}
          filename={classificationModal.filename}
          classification={classificationModal.classification}
          onConfirm={handleConfirmClassification}
          onReject={handleRejectClassification}
        />
      )}
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
      <SubmissionTemplateModal
  isOpen={isTemplateModalOpen}
  onClose={() => setIsTemplateModalOpen(false)}
  clientName={selectedClientName}
  onSubmit={handleCreateSubmissionWithTemplate}
/>
    </div>
  )

}
