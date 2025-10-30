'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder as FolderIcon, FileText, Plus, X } from 'lucide-react'
import type { Client, Submission } from '@/types'

interface FolderPanelProps {
  clients: Client[]
  activeSubmission: Submission | null
  onSubmissionClick: (submission: Submission) => void
  onNewClient: () => void
  onNewSubmission: (clientId: string) => void
  isMobileOpen: boolean
  onMobileToggle: () => void
}

export default function FolderPanel({
  clients,
  activeSubmission,
  onSubmissionClick,
  onNewClient,
  onNewSubmission,
  isMobileOpen,
  onMobileToggle,
}: FolderPanelProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set(clients.map(c => c.client_id))
  )

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  const getStatusBadge = (submission: Submission) => {
    if (submission.status === 'error') {
      return <span className="w-2 h-2 bg-red-500 rounded-full" />
    }
    if (submission.status === 'ready' && submission.file_count > 0) {
      return <span className="w-2 h-2 bg-green-500 rounded-full" />
    }
    if (submission.file_count > 0) {
      return <span className="text-xs text-gray-500">({submission.file_count})</span>
    }
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Clients</h2>
          <button
            onClick={onMobileToggle}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Client Button */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={onNewClient}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        </div>

        {/* Client/Submission Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {clients.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FolderIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-600 font-medium mb-1">No clients yet</p>
              <p className="text-xs text-gray-400">Click &quot;New Client&quot; to start</p>
            </div>
          ) : (
            <div className="space-y-1">
              {clients.map((client) => {
                const isExpanded = expandedClients.has(client.client_id)
                const submissions = client.submissions_detailed || []

                return (
                  <div key={client.client_id} className="space-y-1">
                    {/* Client Row */}
                    <div className="group flex items-center gap-1">
                      <button
                        onClick={() => toggleClient(client.client_id)}
                        className="flex-1 flex items-center gap-2 px-2 py-1.5 text-left rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <FolderIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate flex-1">
                          {client.name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          ({client.submission_count})
                        </span>
                      </button>

                      {/* New Submission Button */}
                      <button
                        onClick={() => onNewSubmission(client.client_id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="New submission"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Submissions */}
                    {isExpanded && (
                      <div className="ml-6 space-y-0.5">
                        {submissions.length === 0 ? (
                          <button
                            onClick={() => onNewSubmission(client.client_id)}
                            className="w-full px-2 py-1.5 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded text-left transition-colors"
                          >
                            + Add submission
                          </button>
                        ) : (
                          submissions.map((submission) => {
                            const isActive = activeSubmission?.submission_id === submission.submission_id

                            return (
                              <button
                                key={submission.submission_id}
                                onClick={() => onSubmissionClick(submission)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-md transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 border border-blue-200'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <FileText
                                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                                    isActive ? 'text-blue-600' : 'text-gray-400'
                                  }`}
                                />
                                <span
                                  className={`text-sm flex-1 truncate ${
                                    isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  {submission.name}
                                </span>
                                {getStatusBadge(submission)}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}