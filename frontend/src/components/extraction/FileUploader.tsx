'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadedExtractionFile } from '@/types/extraction'

interface FileUploaderProps {
  onFilesSelected?: (files: File[]) => void
  onUploadComplete?: (files: UploadedExtractionFile[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  disabled?: boolean
}

const DEFAULT_ACCEPTED_TYPES = [
  '.pdf',
  '.xlsx',
  '.xls',
  '.csv',
  '.jpg',
  '.jpeg',
  '.png',
  '.tiff',
  '.docx',
]

const DEFAULT_MAX_SIZE_MB = 50

export default function FileUploader({
  onFilesSelected,
  onUploadComplete,
  maxFiles = 20,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  className,
  disabled = false,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedExtractionFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get file icon color based on type
  const getFileIconColor = (type: string): string => {
    if (type.includes('pdf')) return 'text-red-500'
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return 'text-green-500'
    if (type.includes('image')) return 'text-blue-500'
    if (type.includes('word') || type.includes('document')) return 'text-blue-600'
    return 'text-gray-500'
  }

  // Validate file
  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit`
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} not supported`
    }

    return null
  }

  // Handle file selection
  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validatedFiles: UploadedExtractionFile[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      const validationError = validateFile(file)
      
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        const isDuplicate = files.some(f => f.name === file.name && f.size === file.size)
        if (isDuplicate) {
          errors.push(`${file.name}: Duplicate file`)
        } else {
          validatedFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadProgress: 0,
            status: 'pending',
          })
        }
      }
    })

    if (errors.length > 0) {
      setError(errors.join(', '))
      setTimeout(() => setError(null), 5000)
    }

    if (validatedFiles.length > 0) {
      const updatedFiles = [...files, ...validatedFiles]
      setFiles(updatedFiles)
      onFilesSelected?.(validatedFiles.map(f => f.file))
      setError(null)
    }
  }, [files, maxFiles, maxSizeMB, acceptedTypes, onFilesSelected])

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const clearAll = () => {
    setFiles([])
    setError(null)
  }

  const openFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl transition-colors cursor-pointer bg-white',
          isDragging && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
      >
        <div className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Supports: {acceptedTypes.join(', ')}
          </p>
          <p className="text-xs text-gray-400">
            Maximum {maxFiles} files • {maxSizeMB}MB per file
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <button
              onClick={clearAll}
              disabled={disabled}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onRemove={removeFile}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// File Item Component
interface FileItemProps {
  file: UploadedExtractionFile
  onRemove: (id: string) => void
  disabled?: boolean
}

function FileItem({ file, onRemove, disabled }: FileItemProps) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'uploaded':
      case 'classified':
      case 'extracted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (file.status) {
      case 'uploading':
      case 'classifying':
      case 'extracting':
        return 'border-blue-200 bg-blue-50'
      case 'uploaded':
      case 'classified':
      case 'extracted':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIconColor = (type: string): string => {
    if (type.includes('pdf')) return 'text-red-500'
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) return 'text-green-500'
    if (type.includes('image')) return 'text-blue-500'
    if (type.includes('word') || type.includes('document')) return 'text-blue-600'
    return 'text-gray-500'
  }

  return (
    <div className={cn('p-3 rounded-lg border transition-colors', getStatusColor())}>
      <div className="flex items-center gap-3">
        {/* File icon */}
        <FileIcon className={cn('w-8 h-8 flex-shrink-0', getFileIconColor(file.type))} />

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {getStatusIcon()}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatFileSize(file.size)}</span>
            {file.classification && (
              <>
                <span>•</span>
                <span className="font-medium text-blue-600">
                  {file.classification.document_type}
                </span>
                <span>•</span>
                <span>
                  {Math.round(file.classification.confidence * 100)}% confidence
                </span>
              </>
            )}
          </div>

          {/* Upload progress */}
          {(file.status === 'uploading' || (file.uploadProgress > 0 && file.uploadProgress < 100)) && (
            <div className="h-1 mt-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${file.uploadProgress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {file.error && (
            <p className="text-xs text-red-600 mt-1">{file.error}</p>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(file.id)}
          disabled={disabled || file.status === 'uploading'}
          className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}