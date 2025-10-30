/**
 * Extraction-specific types
 */
export interface ClassificationResult {
  document_type: string
  confidence: number
  indicators: (string | { value: string; text?: string; [key: string]: unknown })[]
  classifier_results?: Array<{
    classifier: string
    document_type: string
    confidence: number
  }>
  classified_at?: string
}
  
  export interface ExtractionResult {
    success: boolean
    data: Record<string, unknown>
    confidence: number
    warnings?: string[]
    errors?: string[]
    metadata?: {
      extractor_used?: string
      document_type?: string
      extraction_date?: string
      pipeline?: Record<string, unknown>
    }
  }
  
  export interface UploadedExtractionFile {
    id: string
    file: File
    name: string
    size: number
    type: string
    uploadProgress: number
    classification?: ClassificationResult
    extractionResult?: ExtractionResult
    status: 'pending' | 'uploading' | 'uploaded' | 'classifying' | 'classified' | 'extracting' | 'extracted' | 'error'
    error?: string
  }
  
  export interface FusionResult {
    success: boolean
    data: {
      submission_id: string
      application?: Record<string, unknown>
      claims_history?: Record<string, unknown>
      property_schedule?: Record<string, unknown>
      financial_information?: Record<string, unknown>
      supplemental_documents?: Array<Record<string, unknown>>
      applicant?: Record<string, unknown>
      fusion_metadata?: Record<string, unknown>
    }
    confidence: number
    warnings?: string[]
    errors?: string[]
  }
  
  export interface ExtractionJob {
    job_id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    result?: ExtractionResult
    error?: string
    created_at: string
    updated_at: string
  }
  
  export interface DocumentTypeInfo {
    value: string
    label: string
    icon?: string
    color?: string
  }


export interface BatchExtractionRequest {
  file_id: string
  document_type?: string
  extraction_options?: Record<string, unknown>
}

export interface BatchExtractionResult {
  file_id: string
  success: boolean
  data?: Record<string, unknown>
  confidence?: number
  error?: string
  warnings?: string[]
}

export interface BatchExtractionStatus {
  batch_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_files: number
  completed: number
  failed: number
  progress: number
  results: Array<{
    file_id: string
    status: string
    error?: string
  }>
  created_at: string
  updated_at: string
}
