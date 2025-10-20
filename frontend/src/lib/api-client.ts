/**
 * API client for backend communication.
 */

import axios from 'axios'
import type { Submission, FillReport } from '@/types/submission'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Upload PDF and extract data.
 */
export async function uploadPdf(file: File): Promise<Submission> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/submissions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  if (!response.data.success) {
    throw new Error(response.data.error || 'Upload failed')
  }

  return {
    id: response.data.submission_id,
    filename: file.name,
    status: 'extracted',
    confidence: response.data.extraction.confidence,
    warnings: response.data.extraction.warnings,
    data: response.data.extraction.data,
  }
}

/**
 * Get submission by ID.
 */
export async function getSubmission(id: string): Promise<Submission> {
  const response = await api.get(`/submissions/${id}`)
  return response.data.submission
}

/**
 * Update submission data.
 */
export async function updateSubmission(id: string, data: any): Promise<Submission> {
  const response = await api.put(`/submissions/${id}`, data)
  return response.data.submission
}

/**
 * Fill PDF with data.
 */
export async function fillPdf(id: string): Promise<FillReport> {
  const response = await api.post(`/submissions/${id}/fill`)

  if (!response.data.success) {
    throw new Error(response.data.error || 'Fill failed')
  }

  return {
    written: response.data.fill_report.written,
    skipped: response.data.fill_report.skipped,
    warnings: response.data.fill_report.warnings,
    downloadUrl: response.data.download_url,
  }
}

/**
 * Download filled PDF.
 */
export async function downloadPdf(id: string): Promise<void> {
  const response = await api.get(`/submissions/${id}/download`, {
    responseType: 'blob',
  })

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'ACORD_126_filled.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}