/**
 * API client for backend communication.
 */

import axios, { AxiosError } from 'axios'
import type { 
  ApiResponse, 
  SubmissionResponse, 
  FillResponse, 
  SubmissionDetail,
  Folder,
  FillReport
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

/**
 * Error handler
 */
function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>
    
    if (axiosError.response) {
      // Server responded with error
      const message = axiosError.response.data?.error || axiosError.response.data?.message || 'Server error'
      throw new Error(message)
    } else if (axiosError.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.')
    } else {
      // Request setup error
      throw new Error('Failed to make request')
    }
  }
  
  throw new Error('An unexpected error occurred')
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health')
    return response.data.status === 'healthy'
  } catch (error) {
    return false
  }
}

/**
 * Upload PDF and extract data.
 * 
 * @param file - PDF file to upload
 * @param onProgress - Optional progress callback (0-100)
 */
export async function uploadPdf(
  file: File,
  onProgress?: (progress: number) => void
): Promise<SubmissionResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post<ApiResponse<SubmissionResponse>>(
      '/submissions/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed')
    }
    
    const { submission_id, extraction } = response.data.data!;
    
    return {
      submission_id: submission_id!,
      extraction: extraction!,
    }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Upload multiple PDF files.
 * 
 * @param files - Array of PDF files
 * @param onProgress - Optional progress callback per file
 */
export async function uploadMultiplePdfs(
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<SubmissionResponse[]> {
  const results: SubmissionResponse[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadPdf(files[i], (progress) => {
      onProgress?.(i, progress)
    })
    results.push(result)
  }

  return results
}

/**
 * Get submission by ID.
 */
export async function getSubmission(id: string): Promise<SubmissionDetail> {
  try {
    const response = await api.get<ApiResponse<{ submission: SubmissionDetail }>>(
      `/submissions/${id}`
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get submission')
    }

    return response.data.data!.submission
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Update submission data.
 */
export async function updateSubmission(
  id: string,
  data: any
): Promise<SubmissionDetail> {
  try {
    const response = await api.put<ApiResponse<{ submission: SubmissionDetail }>>(
      `/submissions/${id}`,
      data
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to update submission')
    }

    return response.data.data!.submission
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fill PDF with data.
 */
export async function fillPdf(id: string): Promise<FillReport> {
  try {
    const response = await api.post<ApiResponse<FillResponse>>(
      `/submissions/${id}/fill`
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Fill failed')
    }
    const {fill_report,download_url} = response.data.data!;
    return {
      ...fill_report,
      downloadUrl: download_url!,
    }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fill multiple PDFs.
 */
export async function fillMultiplePdfs(ids: string[]): Promise<FillReport[]> {
  const results: FillReport[] = []

  for (const id of ids) {
    const result = await fillPdf(id)
    results.push(result)
  }

  return results
}

/**
 * Download filled PDF.
 */
export async function downloadPdf(id: string, filename?: string): Promise<void> {
  try {
    const response = await api.get(`/submissions/${id}/download`, {
      responseType: 'blob',
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename || 'ACORD_126_filled.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Check if backend is available.
 */
export async function checkBackendAvailability(): Promise<{
  available: boolean
  message: string
}> {
  try {
    const isHealthy = await healthCheck()
    return {
      available: isHealthy,
      message: isHealthy ? 'Backend is available' : 'Backend is not responding',
    }
  } catch (error) {
    return {
      available: false,
      message: 'Cannot connect to backend',
    }
  }
}

// ========================================
// FOLDER OPERATIONS
// ========================================
/**
 * Get all folders.
 */
export async function getFolders(): Promise<Folder[]> {
  try {
    const response = await api.get('/folders')

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get folders')
    }

    return response.data.folders || []
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Create a new folder.
 */
export async function createFolder(name: string): Promise<Folder> {
  try {
    const response = await api.post('/folders', { name })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create folder')
    }

    return response.data.folder 
  } catch (error) {
    handleApiError(error)
  }
}
/**
 * Get folder by ID.
 */
export async function getFolder(id: string): Promise<Folder> {
  try {
    const response = await api.get(`/folders/${id}`)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to get folder')
    }

    return response.data.folder
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Delete folder.
 */
export async function deleteFolder(id: string): Promise<void> {
  try {
    const response = await api.delete<ApiResponse>(`/folders/${id}`)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete folder')
    }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Upload PDF to folder.
 */
export async function uploadPdfToFolder(
  folderId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<SubmissionResponse> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder_id', folderId)

    const response = await api.post( 
      '/submissions/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed')
    }

    return {
      submission_id: response.data.submission_id,
      extraction: response.data.extraction,
    }
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Upload multiple PDFs to folder.
 */
export async function uploadMultiplePdfsToFolder(
  folderId: string,
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<SubmissionResponse[]> {
  try {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    formData.append('folder_id', folderId)

    const response = await api.post<ApiResponse<any>>(
      '/submissions/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed')
    }
    const results = response.data.data!;
    return results || []
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Fill multiple PDFs.
 */
export async function batchFillPdfs(submissionIds: string[]): Promise<FillResponse[]> {
  try {
    const response = await api.post(
      '/submissions/batch-fill',
      { submission_ids: submissionIds }
    )

    if (!response.data.success) {
      throw new Error(response.data.error || 'Batch fill failed')
    }
    const {results} = response.data.results;
    return results || []
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Delete a submission.
 */
export async function deleteSubmission(id: string): Promise<void> {
  try {
    await api.delete(`/submissions/${id}`)
  } catch (error) {
    // Ignore 404 errors (endpoint might not exist yet)
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn('Delete endpoint not implemented on backend')
      return
    }
    handleApiError(error)
  }
}

/**
 * Get preview URL for a submission's input file.
 */
export function getInputPreviewUrl(submissionId: string): string {
  return `${API_BASE_URL}/api/submissions/${submissionId}/preview-input`
}

/**
 * Get preview URL for a submission's output file.
 */
export function getOutputPreviewUrl(submissionId: string): string {
  return `${API_BASE_URL}/api/submissions/${submissionId}/preview-output`
}