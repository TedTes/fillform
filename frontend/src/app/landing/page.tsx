/**
 * Landing page - honest presentation of AutoFil
 */

'use client'

import { useRouter } from 'next/navigation'
import { Upload, Zap, Download, CheckCircle, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AutoFil</h1>
            <p className="text-xs text-gray-600">ACORD Form Filler</p>
          </div>
          <button
            onClick={handleGetStarted}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          Automate ACORD Form Filling
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Extract data from filled ACORD 126 PDFs and automatically fill blank templates. 
          Save time on repetitive form processing.
        </p>
        <button
          onClick={handleGetStarted}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-base font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
          Try It Now
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-sm text-gray-500 mt-4">
          No signup required • Works in your browser
        </p>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                1. Upload Files
              </h4>
              <p className="text-sm text-gray-600">
                Upload your filled ACORD 126 PDF forms. The system extracts data automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                2. Generate Output
              </h4>
              <p className="text-sm text-gray-600">
                Click generate to fill blank ACORD 126 templates with your extracted data.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                3. Download
              </h4>
              <p className="text-sm text-gray-600">
                Download your filled PDF forms, ready to use. Organized by folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">ACORD 126 Support</h4>
                <p className="text-sm text-gray-600">
                  Currently supports ACORD 126 form processing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Multiple Files</h4>
                <p className="text-sm text-gray-600">
                  Process multiple forms at once for batch operations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Folder Organization</h4>
                <p className="text-sm text-gray-600">
                  Keep your forms organized with folder management
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Browser-Based</h4>
                <p className="text-sm text-gray-600">
                  Works entirely in your browser, no installation needed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Preview Files</h4>
                <p className="text-sm text-gray-600">
                  Preview PDFs before downloading
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Extraction Confidence</h4>
                <p className="text-sm text-gray-600">
                  See confidence scores for extracted data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Who Is This For?
          </h3>
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <p className="text-gray-600 mb-4">
              AutoFil is designed for insurance professionals who need to:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Process multiple ACORD 126 forms regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Transfer data from filled forms to blank templates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Save time on repetitive form filling tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Maintain organized records of form processing</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Current Limitations */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Current Limitations
          </h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
            <p className="text-sm text-gray-700 mb-4">
              <strong>Please note:</strong>
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Currently supports ACORD 126 forms only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Extraction accuracy depends on source PDF quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Data is stored locally in your browser session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>No data editing before filling (coming soon)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Try AutoFil now. No signup required.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Start Using AutoFil
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            AutoFil © {new Date().getFullYear()} • ACORD Form Automation Tool
          </p>
        </div>
      </footer>
    </div>
  )
}