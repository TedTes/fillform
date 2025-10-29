/**
 * Extraction-specific types
 */

export interface ClassificationResult {
    document_type: string
    confidence: number
    indicators: string[]
    classifier_results?: Array<{
      classifier: string
      document_type: string
      confidence: number
    }>
  }
  
  export interface ExtractionResult {
    success: boolean
    data: Record<string, any>
    confidence: number
    warnings?: string[]
    errors?: string[]
    metadata?: {
      extractor_used?: string
      document_type?: string
      extraction_date?: string
      pipeline?: Record<string, any>
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
      application?: Record<string, any>
      claims_history?: Record<string, any>
      property_schedule?: Record<string, any>
      financial_information?: Record<string, any>
      supplemental_documents?: Array<Record<string, any>>
      applicant?: Record<string, any>
      fusion_metadata?: Record<string, any>
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