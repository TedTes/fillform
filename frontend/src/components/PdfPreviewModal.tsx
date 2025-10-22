/**
 * PDF Preview Modal Component
 * Displays PDF files in an iframe with controls
 */

'use client'

import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useState } from 'react'

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  filename: string
  onDownload?: () => void
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  fileUrl,
  filename,
  onDownload,
}: PdfPreviewModalProps) {
  const [zoom, setZoom] = useState(100)

  if (!isOpen) return null

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  // Handle ESC key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {filename}
              </h2>
              <p className="text-sm text-gray-500">PDF Preview</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 ml-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-gray-700" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Download Button */}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100">
            <iframe
              src={`${fileUrl}#zoom=${zoom}`}
              className="w-full h-full border-0"
              title={filename}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Press ESC to close • Use browser's PDF controls for page navigation
            </p>
          </div>
        </div>
      </div>
    </>
  )
}