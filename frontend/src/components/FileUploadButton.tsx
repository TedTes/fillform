/**
 * File upload button component - enhanced design.
 */

'use client'

import { Upload } from 'lucide-react'

interface FileUploadButtonProps {
  onClick: () => void
}

export default function FileUploadButton({ onClick }: FileUploadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
    >
      <Upload className="w-4 h-4" />
      Upload Files
    </button>
  )
}