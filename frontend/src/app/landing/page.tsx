'use client'

import { useRouter } from 'next/navigation'
import { Upload, Zap, Download, CheckCircle, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const handleGetStarted = () => router.push('/dashboard')

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white/70 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AutoFil</h1>
              <p className="text-[11px] text-gray-500">Smart Form Automation</p>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center bg-gray-50 overflow-hidden py-20">
        {/* Hero Text */}
        <div className="max-w-4xl mx-auto px-6 py-12 mt-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Automate Insurance Document Submission Flow
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 mb-8">
            Upload client forms, policies, or templates — AutoFil extracts structured data from your inputs 
            and generates ready-to-send filled outputs in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700"
            >
              Try It Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 h-5 py-2">No signup required • Works directly in your browser</p>
        </div>

        {/* Demo Video */}
        <div className="w-full max-w-7xl mx-auto px-30">
          <div className="relative aspect-video overflow-hidden rounded-xl shadow-md mx-11">
            <video
              src="/Screen-Recording-2025-10-24-at-8-25-39-PM.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">1. Upload Input Files</h4>
              <p className="text-sm text-gray-600">
                Add any client or policy documents. AutoFil scans them to extract names, values, and key fields automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">2. Generate Outputs</h4>
              <p className="text-sm text-gray-600">
                Select any blank form or template as the output. AutoFil merges data from your input files into the new document.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">3. Review & Download</h4>
              <p className="text-sm text-gray-600">
                Instantly preview, verify, and download the filled outputs — ready for submission, underwriting, or sharing with clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Why AutoFil</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Universal Form Support', desc: 'Works with any fillable insurance PDF or structured form — commercial or personal lines.' },
              { title: 'Multi-Document Handling', desc: 'Upload multiple inputs and outputs to automate full workflows, not single files.' },
              { title: 'Smart Data Extraction', desc: 'Auto-detects fields, values, and mappings from your uploaded files.' },
              { title: 'Instant Preview', desc: 'Open and review filled outputs before downloading.' },
              { title: 'Browser-Based', desc: 'Runs locally in your browser — no server uploads, no waiting.' },
              { title: 'Confidence Indicators', desc: 'See confidence levels for extracted fields to verify quality fast.' },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">{f.title}</h4>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USE CASE */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">Built for Insurance Workflows</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            AutoFil helps brokers, underwriting teams, and agencies handle document-heavy workflows effortlessly.
            Replace tedious form-filling with fast, accurate automation that fits any document type.
          </p>

          <ul className="text-gray-700 text-sm space-y-3 max-w-sm mx-auto text-left">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span> Combine multiple input forms into one cohesive output package
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span> Generate proposals, renewals, or compliance forms automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span> Maintain consistent formatting and accuracy across documents
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-4">Save Time on Every Form</h3>
          <p className="text-lg text-blue-100 mb-8">
            Automate repetitive insurance paperwork — start using AutoFil for free in your browser.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 shadow-md transition-all"
          >
            Launch AutoFil
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        AutoFil © {new Date().getFullYear()} — Universal Document Automation for Insurance Professionals
      </footer>
    </div>
  )
}
