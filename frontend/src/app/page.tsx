'use client'

import { useState } from 'react'
import { mockFolders, getInputFilesForFolder, getOutputFilesForFolder } from '@/lib/mock-data'
import type { Folder } from '@/types/folder'

export default function Home() {
  const [activeFolder, setActiveFolder] = useState<Folder>(mockFolders[0])

  const inputFiles = getInputFilesForFolder(activeFolder.id)
  const outputFiles = getOutputFilesForFolder(activeFolder.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AutoFil</h1>
          <p className="text-sm text-gray-600">ACORD Form Filler</p>
        </div>
      </header>

      {/* Main Layout: Two Panels */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel: Folders */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase">Folders</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                + New
              </button>
            </div>

            {/* Folder List */}
            <div className="space-y-2">
              {mockFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeFolder.id === folder.id
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📁</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{folder.name}</p>
                      <p className="text-xs text-gray-500">{folder.fileCount} files</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel: Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-6xl mx-auto">
            {/* Folder Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{activeFolder.name}</h2>
              <p className="text-sm text-gray-500">
                {inputFiles.length} input files • {outputFiles.length} output files
              </p>
            </div>

            {/* Input Files Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Input Files ({inputFiles.length})
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  + Upload Files
                </button>
              </div>

              {inputFiles.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No files uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Upload Files" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inputFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                            {file.confidence && (
                              <span className="text-xs text-green-600">
                                ✓ {Math.round(file.confidence * 100)}% confidence
                              </span>
                            )}
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Output Files Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Output Files ({outputFiles.length})
                </h3>
                {inputFiles.length > 0 && outputFiles.length === 0 && (
                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    Generate Output
                  </button>
                )}
              </div>

              {outputFiles.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">No outputs generated yet</p>
                  {inputFiles.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Click "Generate Output" to create filled PDFs
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {outputFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📥</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                            <p className="text-xs text-gray-400">
                              ← from {file.inputFilename}
                            </p>
                            {file.fieldsWritten && (
                              <span className="text-xs text-green-600">
                                {file.fieldsWritten} fields
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            📥
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            👁️
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}