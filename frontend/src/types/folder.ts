/**
 * Folder types for file organization.
 */

export interface Folder {
    id: string
    name: string
    createdAt: string
    fileCount: number
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