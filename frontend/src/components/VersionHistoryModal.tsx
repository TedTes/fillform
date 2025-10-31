'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Clock,
  User,
  FileEdit,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Edit2,
  GitBranch,
  AlertCircle
} from 'lucide-react'
import type { VersionSummary, AuditTrailEntry } from '@/types/version'

interface VersionHistoryModalProps {
  submissionId: string
  isOpen: boolean
  onClose: () => void
  onRollback?: (versionId: string) => void
}

export default function VersionHistoryModal({
  submissionId,
  isOpen,
  onClose,
  onRollback
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'versions' | 'audit'>('versions')

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen, submissionId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch versions
      const versionsRes = await fetch(`/api/submissions/${submissionId}/versions`)
      const versionsData = await versionsRes.json()

      if (!versionsData.success) {
        throw new Error(versionsData.error || 'Failed to load versions')
      }

      setVersions(versionsData.versions || [])

      // Fetch audit trail
      const auditRes = await fetch(`/api/submissions/${submissionId}/audit-trail`)
      const auditData = await auditRes.json()

      if (!auditData.success) {
        throw new Error(auditData.error || 'Failed to load audit trail')
      }

      setAuditTrail(auditData.audit_trail || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const toggleVersion = (versionId: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(versionId)) {
        newSet.delete(versionId)
      } else {
        newSet.add(versionId)
      }
      return newSet
    })
  }

  const handleRollback = async (versionId: string, versionNumber: number) => {
    if (!confirm(`Are you sure you want to rollback to Version ${versionNumber}? This will create a new version with the old data.`)) {
      return
    }

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/versions/${versionId}/rollback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: 'user',
            notes: `Rolled back to version ${versionNumber}`
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Rollback failed')
      }

      // Refresh data
      await fetchData()

      // Notify parent
      if (onRollback) {
        onRollback(versionId)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Rollback failed')
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'extract':
        return <FileEdit className="w-4 h-4" />
      case 'update':
        return <Edit2 className="w-4 h-4" />
      case 'rollback':
        return <RotateCcw className="w-4 h-4" />
      case 'fill':
        return <FileEdit className="w-4 h-4" />
      default:
        return <GitBranch className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'extract':
        return 'text-blue-600 bg-blue-50'
      case 'update':
        return 'text-green-600 bg-green-50'
      case 'rollback':
        return 'text-orange-600 bg-orange-50'
      case 'fill':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
              <p className="text-sm text-gray-600">Track all changes to this submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Versions ({versions.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Audit Trail ({auditTrail.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : activeTab === 'versions' ? (
            <VersionsList
              versions={versions}
              expandedVersions={expandedVersions}
              onToggle={toggleVersion}
              onRollback={handleRollback}
              getActionIcon={getActionIcon}
              getActionColor={getActionColor}
            />
          ) : (
            <AuditTrailList
              auditTrail={auditTrail}
              getActionIcon={getActionIcon}
              getActionColor={getActionColor}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {activeTab === 'versions' 
                ? `${versions.length} version${versions.length !== 1 ? 's' : ''} total`
                : `${auditTrail.length} audit entr${auditTrail.length !== 1 ? 'ies' : 'y'}`
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Versions List Component
interface VersionsListProps {
  versions: VersionSummary[]
  expandedVersions: Set<string>
  onToggle: (id: string) => void
  onRollback: (id: string, version: number) => void
  getActionIcon: (action: string) => React.ReactNode
  getActionColor: (action: string) => string
}

function VersionsList({
  versions,
  expandedVersions,
  onToggle,
  onRollback,
  getActionIcon,
  getActionColor
}: VersionsListProps) {
  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No versions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {versions.slice().reverse().map((version, idx) => {
        const isExpanded = expandedVersions.has(version.version_id)
        const isCurrent = idx === 0

        return (
          <div
            key={version.version_id}
            className={`border rounded-lg overflow-hidden transition-all ${
              isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            {/* Version Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => onToggle(version.version_id)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getActionColor(version.action)}`}>
                  {getActionIcon(version.action)}
                  <span className="text-sm font-medium capitalize">{version.action}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Version {version.version_number}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {version.created_by}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(version.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => onRollback(version.version_id, version.version_number)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rollback
                  </button>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-200 bg-gray-50">
                {version.notes && (
                  <div className="pt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-sm text-gray-600">{version.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Changes:</p>
                  <div className="space-y-2">
                    {version.changes.added.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Plus className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">
                            {version.changes.added.length} field{version.changes.added.length !== 1 ? 's' : ''} added
                          </p>
                          <div className="mt-1 space-y-1">
                            {version.changes.added.slice(0, 3).map((change, i) => (
                              <p key={i} className="text-xs text-gray-600 font-mono">
                                {change.field}
                              </p>
                            ))}
                            {version.changes.added.length > 3 && (
                              <p className="text-xs text-gray-500">
                                + {version.changes.added.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {version.changes.modified.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Edit2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-700">
                            {version.changes.modified.length} field{version.changes.modified.length !== 1 ? 's' : ''} modified
                          </p>
                          <div className="mt-1 space-y-1">
                            {version.changes.modified.slice(0, 3).map((change, i) => (
                              <p key={i} className="text-xs text-gray-600 font-mono">
                                {change.field}
                              </p>
                            ))}
                            {version.changes.modified.length > 3 && (
                              <p className="text-xs text-gray-500">
                                + {version.changes.modified.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {version.changes.deleted.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Minus className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-700">
                            {version.changes.deleted.length} field{version.changes.deleted.length !== 1 ? 's' : ''} deleted
                          </p>
                          <div className="mt-1 space-y-1">
                            {version.changes.deleted.slice(0, 3).map((change, i) => (
                              <p key={i} className="text-xs text-gray-600 font-mono">
                                {change.field}
                              </p>
                            ))}
                            {version.changes.deleted.length > 3 && (
                              <p className="text-xs text-gray-500">
                                + {version.changes.deleted.length - 3} more
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {version.changes.added.length === 0 &&
                      version.changes.modified.length === 0 &&
                      version.changes.deleted.length === 0 && (
                        <p className="text-sm text-gray-500">No changes recorded</p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Audit Trail List Component
interface AuditTrailListProps {
  auditTrail: AuditTrailEntry[]
  getActionIcon: (action: string) => React.ReactNode
  getActionColor: (action: string) => string
}

function AuditTrailList({
  auditTrail,
  getActionIcon,
  getActionColor
}: AuditTrailListProps) {
  if (auditTrail.length === 0) {
    return (
      <div className="text-center py-12">
        <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No audit entries yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {auditTrail.slice().reverse().map((entry, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
            {getActionIcon(entry.action)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 capitalize">{entry.action}</span>
              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                v{entry.version_number}
              </span>
            </div>

            {entry.notes && (
              <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {entry.user}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>

            {(entry.changes_summary.added > 0 ||
              entry.changes_summary.modified > 0 ||
              entry.changes_summary.deleted > 0) && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                {entry.changes_summary.added > 0 && (
                  <span className="text-green-600">+{entry.changes_summary.added}</span>
                )}
                {entry.changes_summary.modified > 0 && (
                  <span className="text-blue-600">~{entry.changes_summary.modified}</span>
                )}
                {entry.changes_summary.deleted > 0 && (
                  <span className="text-red-600">-{entry.changes_summary.deleted}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}