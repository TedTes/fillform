'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import SubmissionCard from '@/components/SubmissionCard'
import { uploadPdf } from '@/lib/api-client'
import type { Submission } from '@/types/submission'

export default function Home() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (16MB)
    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const result = await uploadPdf(file)
      setSubmission(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AutoFil</h1>
        <p className="text-gray-600 mt-1">ACORD Form Filler</p>
      </header>

      {/* Upload Section */}
      {!submission && (
        <div className="mb-8">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">
                {uploading ? (
                  <span className="font-semibold">Uploading...</span>
                ) : (
                  <>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">ACORD 126 PDF (MAX. 16MB)</p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Submission Card */}
      {submission && (
        <SubmissionCard
          submission={submission}
          onReset={() => setSubmission(null)}
        />
      )}
    </main>
  )
}