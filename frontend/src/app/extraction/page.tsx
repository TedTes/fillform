'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, FileCheck, Download } from 'lucide-react'
import { 
  FileUploader,
  ClassificationPreview,
  ExtractionResults 
} from '@/components/extraction'
import ClassificationModal from '@/components/ClassificationModal'
import ExtractionResultsModal from '@/components/ExtractionResultsModal'
import useToast from '@/hooks/useToast'
import {
  uploadFileForExtraction,
  classifyDocument,
  extractDocument,
  downloadExtractionResult,
} from '@/lib/api-client'
import type { 
  UploadedExtractionFile,
  ClassificationResult,
  ExtractionResult 
} from '@/types/extraction'

type WorkflowStep = 'upload' | 'classify' | 'extract' | 'review'

export default function ExtractionPage() {
  const router = useRouter()
  const toast = useToast()

  // State
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedExtractionFile[]>([])
  const [selectedFile, setSelectedFile] = useState<UploadedExtractionFile | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Modal state
  const [classificationModal, setClassificationModal] = useState<{
    isOpen: boolean
    file: UploadedExtractionFile | null
  }>({ isOpen: false, file: null })

  const [extractionModal, setExtractionModal] = useState<{
    isOpen: boolean
    file: UploadedExtractionFile | null
  }>({ isOpen: false, file: null })

  // Handle file upload
  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true)
    
    for (const file of files) {
      const uploadedFile: UploadedExtractionFile = {
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadProgress: 0,
        status: 'pending',
      }

      setUploadedFiles(prev => [...prev, uploadedFile])

      try {
        // Upload
        uploadedFile.status = 'uploading'
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'uploading' } : f)
        )

        const uploadResult = await uploadFileForExtraction(
          file,
          { autoClassify: true },
          (progress) => {
            setUploadedFiles(prev =>
              prev.map(f => 
                f.id === uploadedFile.id 
                  ? { ...f, uploadProgress: progress }
                  : f
              )
            )
          }
        )

        // Update with uploaded file ID
        uploadedFile.id = uploadResult.file_id
        uploadedFile.status = 'uploaded'
        uploadedFile.uploadProgress = 100

        setUploadedFiles(prev =>
          prev.map(f => 
            f.name === uploadedFile.name 
              ? { ...uploadedFile }
              : f
          )
        )

        // If classification included, show it
        if (uploadResult.classification) {
          uploadedFile.classification = uploadResult.classification
          uploadedFile.status = 'classified'
          
          setUploadedFiles(prev =>
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { ...uploadedFile }
                : f
            )
          )

          // Auto-open classification modal for first file
          if (uploadedFiles.length === 0) {
            setClassificationModal({
              isOpen: true,
              file: uploadedFile,
            })
          }
        }

        toast.success(`${file.name} uploaded successfully`)
      } catch (error) {
        uploadedFile.status = 'error'
        uploadedFile.error = error instanceof Error ? error.message : 'Upload failed'
        
        setUploadedFiles(prev =>
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...uploadedFile }
              : f
          )
        )

        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setIsProcessing(false)
    setCurrentStep('classify')
  }

  // Handle classification confirmation
  const handleClassifyFile = async (file: UploadedExtractionFile) => {
    if (file.classification) {
      setClassificationModal({ isOpen: true, file })
    } else {
      // Classify now
      try {
        setIsProcessing(true)
        const classification = await classifyDocument(file.id)
        
        file.classification = classification
        file.status = 'classified'
        
        setUploadedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...file } : f)
        )

        setClassificationModal({ isOpen: true, file })
      } catch (error) {
        toast.error('Classification failed')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  // Handle classification confirmation
  const handleConfirmClassification = async () => {
    const file = classificationModal.file
    if (!file) return

    toast.success('Classification confirmed')
    setClassificationModal({ isOpen: false, file: null })

    // Auto-proceed to extraction
    await handleExtractFile(file)
  }

  // Handle classification rejection
  const handleRejectClassification = () => {
    const file = classificationModal.file
    if (!file) return

    toast.warning('Classification rejected - please reclassify')
    
    // Reset classification
    file.classification = undefined
    file.status = 'uploaded'
    
    setUploadedFiles(prev =>
      prev.map(f => f.id === file.id ? { ...file } : f)
    )

    setClassificationModal({ isOpen: false, file: null })
  }

  // Handle extraction
  const handleExtractFile = async (file: UploadedExtractionFile) => {
    if (!file.classification) {
      toast.error('Please classify the document first')
      return
    }

    try {
      setIsProcessing(true)
      file.status = 'extracting'
      
      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id ? { ...file } : f)
      )

      const extractionResult = await extractDocument(file.id, {
        documentType: file.classification.document_type,
      })

      file.extractionResult = extractionResult
      file.status = 'extracted'

      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id ? { ...file } : f)
      )

      toast.success('Data extracted successfully')
      setCurrentStep('review')

      // Show extraction results modal
      setExtractionModal({ isOpen: true, file })
    } catch (error) {
      file.status = 'error'
      file.error = error instanceof Error ? error.message : 'Extraction failed'
      
      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id ? { ...file } : f)
      )

      toast.error('Extraction failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle field edit
  const handleEditField = (fileId: string, field: string, value: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id === fileId && f.extractionResult) {
          return {
            ...f,
            extractionResult: {
              ...f.extractionResult,
              data: {
                ...f.extractionResult.data,
                [field]: value,
              },
            },
          }
        }
        return f
      })
    )
    toast.success('Field updated')
  }

  // Handle download extraction
  const handleDownloadExtraction = async (fileId: string, filename: string) => {
    try {
      await downloadExtractionResult(fileId, filename)
      toast.success('Download started')
    } catch (error) {
      toast.error('Download failed')
    }
  }

  // Handle proceed to fill
  const handleProceedToFill = (file: UploadedExtractionFile) => {
    if (!file.extractionResult) return
    
    toast.info('Redirecting to fill workflow...')
    // TODO: Navigate to fill page or trigger fill API
    router.push(`/dashboard`) // For now, go back to dashboard
  }

  // Get step progress
  const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'upcoming' => {
    const steps: WorkflowStep[] = ['upload', 'classify', 'extract', 'review']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Document Extraction
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Upload, classify, and extract data from documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <StepIndicator
              step="upload"
              label="Upload Files"
              icon={Upload}
              status={getStepStatus('upload')}
            />
            <StepConnector completed={getStepStatus('classify') !== 'upcoming'} />
            <StepIndicator
              step="classify"
              label="Classify Documents"
              icon={FileCheck}
              status={getStepStatus('classify')}
            />
            <StepConnector completed={getStepStatus('extract') !== 'upcoming'} />
            <StepIndicator
              step="extract"
              label="Extract Data"
              icon={Download}
              status={getStepStatus('extract')}
            />
            <StepConnector completed={getStepStatus('review') !== 'upcoming'} />
            <StepIndicator
              step="review"
              label="Review & Proceed"
              icon={FileCheck}
              status={getStepStatus('review')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <FileUploader
              onFilesSelected={handleFilesSelected}
              maxFiles={10}
              maxSizeMB={50}
              disabled={isProcessing}
            />
          </div>
        )}

        {/* Step 2: Classify */}
        {currentStep === 'classify' && uploadedFiles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Uploaded Files ({uploadedFiles.length})
              </h2>
              <button
                onClick={() => setCurrentStep('upload')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upload More
              </button>
            </div>

            <div className="grid gap-4">
              {uploadedFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClassify={() => handleClassifyFile(file)}
                  onExtract={() => handleExtractFile(file)}
                  onViewResults={() => setExtractionModal({ isOpen: true, file })}
                  disabled={isProcessing}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3 & 4: Extract & Review (combined view) */}
        {(currentStep === 'extract' || currentStep === 'review') && uploadedFiles.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Extraction Results ({uploadedFiles.filter(f => f.status === 'extracted').length}/{uploadedFiles.length})
            </h2>

            <div className="grid gap-4">
              {uploadedFiles.map(file => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClassify={() => handleClassifyFile(file)}
                  onExtract={() => handleExtractFile(file)}
                  onViewResults={() => setExtractionModal({ isOpen: true, file })}
                  onProceed={() => handleProceedToFill(file)}
                  disabled={isProcessing}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {classificationModal.file && classificationModal.file.classification && (
        <ClassificationModal
          isOpen={classificationModal.isOpen}
          onClose={() => setClassificationModal({ isOpen: false, file: null })}
          filename={classificationModal.file.name}
          classification={classificationModal.file.classification}
          onConfirm={handleConfirmClassification}
          onReject={handleRejectClassification}
        />
      )}

      {extractionModal.file && extractionModal.file.extractionResult && (
        <ExtractionResultsModal
          isOpen={extractionModal.isOpen}
          onClose={() => setExtractionModal({ isOpen: false, file: null })}
          filename={extractionModal.file.name}
          result={extractionModal.file.extractionResult}
          onEdit={(field, value) => handleEditField(extractionModal.file!.id, field, value)}
          onDownload={() => handleDownloadExtraction(extractionModal.file!.id, extractionModal.file!.name)}
          onProceed={() => handleProceedToFill(extractionModal.file!)}
        />
      )}
    </div>
  )
}

// Step Indicator Component
interface StepIndicatorProps {
  step: WorkflowStep
  label: string
  icon: React.ComponentType<{ className?: string }>
  status: 'completed' | 'current' | 'upcoming'
}

function StepIndicator({ label, icon: Icon, status }: StepIndicatorProps) {
  const getStyles = () => {
    switch (status) {
      case 'completed':
        return {
          container: 'bg-green-100 border-green-500',
          icon: 'text-green-600',
          text: 'text-green-900',
        }
      case 'current':
        return {
          container: 'bg-blue-100 border-blue-500',
          icon: 'text-blue-600',
          text: 'text-blue-900',
        }
      case 'upcoming':
        return {
          container: 'bg-gray-100 border-gray-300',
          icon: 'text-gray-400',
          text: 'text-gray-500',
        }
    }
  }

  const styles = getStyles()

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${styles.container}`}>
        <Icon className={`w-6 h-6 ${styles.icon}`} />
      </div>
      <span className={`text-sm font-medium ${styles.text}`}>
        {label}
      </span>
    </div>
  )
}

// Step Connector Component
function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div className={`flex-1 h-0.5 mx-4 ${completed ? 'bg-green-500' : 'bg-gray-300'}`} />
  )
}

// File Card Component
interface FileCardProps {
  file: UploadedExtractionFile
  onClassify: () => void
  onExtract: () => void
  onViewResults: () => void
  onProceed?: () => void
  disabled?: boolean
}

function FileCard({ file, onClassify, onExtract, onViewResults, onProceed, disabled }: FileCardProps) {
  const getStatusBadge = () => {
    const badges = {
      pending: { text: 'Pending', color: 'bg-gray-100 text-gray-700' },
      uploading: { text: 'Uploading...', color: 'bg-blue-100 text-blue-700' },
      uploaded: { text: 'Uploaded', color: 'bg-green-100 text-green-700' },
      classifying: { text: 'Classifying...', color: 'bg-blue-100 text-blue-700' },
      classified: { text: 'Classified', color: 'bg-green-100 text-green-700' },
      extracting: { text: 'Extracting...', color: 'bg-blue-100 text-blue-700' },
      extracted: { text: 'Extracted', color: 'bg-green-100 text-green-700' },
      error: { text: 'Error', color: 'bg-red-100 text-red-700' },
    }

    const badge = badges[file.status]
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
            {file.name}
          </h3>
          {getStatusBadge()}
        </div>
      </div>

      {/* Classification Preview */}
      {file.classification && (
        <div className="mb-4">
          <ClassificationPreview
            filename={file.name}
            classification={file.classification}
            showActions={false}
          />
        </div>
      )}

      {/* Extraction Preview */}
      {file.extractionResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                Data Extracted Successfully
              </p>
              <p className="text-xs text-green-700 mt-1">
                {Object.keys(file.extractionResult.data).length} fields • {' '}
                {Math.round(file.extractionResult.confidence * 100)}% confidence
              </p>
            </div>
            <button
              onClick={onViewResults}
              className="text-sm text-green-700 hover:text-green-800 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {file.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{file.error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {file.status === 'uploaded' && (
          <button
            onClick={onClassify}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Classify Document
          </button>
        )}

        {file.status === 'classified' && (
          <button
            onClick={onExtract}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Extract Data
          </button>
        )}

        {file.status === 'extracted' && (
          <>
            <button
              onClick={onViewResults}
              className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors"
            >
              View Results
            </button>
            {onProceed && (
              <button
                onClick={onProceed}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Proceed to Fill
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}