/**
 * API response types.
 */

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  
  export interface SubmissionResponse {
    submission_id: string
    extraction: {
      confidence: number
      warnings: string[]
      data: any
    }
  }
  
  export interface FillResponse {
    fill_report: {
      written: number
      skipped: number
      warnings: string[]
    }
    download_url: string
  }
  
  export interface SubmissionDetail {
    submission_id: string
    filename: string
    status: 'extracted' | 'filled'
    uploaded_at: string
    confidence?: number
    warnings?: string[]
    data?: any
  }