/**
 * TypeScript types for submission data.
 */

export interface CardSubmission {
  id: string
  folderId: string
  filename: string
  status: 'uploaded' | 'extracted' | 'filled'
  confidence?: number
  warnings?: string[]
  data?: unknown
  outputFilename?: string
}

export interface FillReport {
  written: number
  skipped: number
  warnings: string[]
  downloadUrl: string
}

// export interface ExtractionResult {
//   confidence: number
//   warnings: string[]
//   data: unknown
// }