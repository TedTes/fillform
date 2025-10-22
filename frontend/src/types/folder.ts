/**
 * Folder types for file organization.
 */

export interface Folder {
  id?: string;  // Keep for frontend compatibility
  folder_id: string;  // Backend uses this
  name: string;
  created_at: string;
  file_count: number;
  submissions?: any[]
  submissions_detailed?: any[]
}
  export interface InputFile {
    id: string
    folderId: string
    filename: string
    size: number
    status: 'uploading' | 'uploaded' | 'extracting' | 'ready' | 'error'
    uploadedAt: string
    confidence?: number
  }
  
  export interface OutputFile {
    id: string
    folderId: string
    inputFileId: string
    inputFilename: string
    filename: string
    size: number
    status: 'generating' | 'ready' | 'error'
    generatedAt: string
    fieldsWritten?: number
    fieldsSkipped?: number
  }