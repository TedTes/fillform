'use client'

import { useState, useEffect } from 'react'
import {
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import type { ComparisonResult, Conflict, Resolution } from '@/types/comparison'

interface ComparisonModalProps {
  submissionId: string
  isOpen: boolean
  onClose: () => void
  onResolve?: () => void
}

export default function ComparisonModal({
  submissionId,
  isOpen,
  onClose,
  onResolve
}: ComparisonModalProps) {
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set())
  const [resolutions, setResolutions] = useState<Map<string, Resolution>>(new Map())
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchComparison()
    }
  }, [isOpen, submissionId])

  const fetchComparison = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${submissionId}/compare-with-original`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load comparison')
      }

      setComparison(data.comparison)
      
      // Auto-expand high severity conflicts
      const highSeverity= new Set(
        data.comparison.conflicts
          .filter((c: Conflict) => c.severity === 'high')
          .map((c: Conflict) => c.field)
      ) as Set<string>
      setExpandedConflicts(highSeverity)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison')
    } finally {
      setLoading(false)
    }
  }

  const toggleConflict = (field: string) => {
    setExpandedConflicts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(field)) {
        newSet.delete(field)
      } else {
        newSet.add(field)
      }
      return newSet
    })
  }

  const setResolution = (field: string, resolution: Resolution) => {
    setResolutions(prev => {
      const newMap = new Map(prev)
      newMap.set(field, resolution)
      return newMap
    })
  }

  const handleResolveAll = async () => {
    if (resolutions.size === 0) {
      alert('No resolutions selected')
      return
    }

    if (!confirm(`Resolve ${resolutions.size} conflict(s)? This will update the submission data.`)) {
      return
    }

    setResolving(true)

    try {
      const response = await fetch(
        `/api/submissions/${submissionId}/conflicts/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comparison_id: comparison?.comparison_id,
            resolutions: Array.from(resolutions.values()),
            user: 'user'
          })
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to resolve conflicts')
      }

      alert(`Successfully resolved ${resolutions.size} conflict(s)`)
      
      if (onResolve) {
        onResolve()
      }
      
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve conflicts')
    } finally {
      setResolving(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'medium':
        return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'low':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Data Comparison</h2>
              <p className="text-sm text-gray-600">Review changes and resolve conflicts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        {comparison && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {comparison.summary.conflicts}
                </div>
                <div className="text-xs text-gray-600">Conflicts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {comparison.summary.only_in_b}
                </div>
                <div className="text-xs text-gray-600">Added Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {comparison.summary.only_in_a}
                </div>
                <div className="text-xs text-gray-600">Removed Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {comparison.summary.matching}
                </div>
                <div className="text-xs text-gray-600">Matching</div>
              </div>
            </div>
          </div>
        )}

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
          ) : comparison ? (
            <div className="space-y-6">
              {/* Conflicts Section */}
              {comparison.conflicts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Conflicts Requiring Resolution
                  </h3>
                  <div className="space-y-3">
                    {comparison.conflicts.map((conflict) => (
                      <ConflictCard
                        key={conflict.field}
                        conflict={conflict}
                        isExpanded={expandedConflicts.has(conflict.field)}
                        onToggle={() => toggleConflict(conflict.field)}
                        resolution={resolutions.get(conflict.field)}
                        onResolve={(resolution) => setResolution(conflict.field, resolution)}
                        getSeverityColor={getSeverityColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Added Fields */}
              {comparison.only_in_b.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    New Fields ({comparison.only_in_b.length})
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {comparison.only_in_b.slice(0, 5).map((field) => (
                        <div key={field.field} className="flex justify-between text-sm">
                          <span className="font-mono text-gray-700">{field.field}</span>
                          <span className="text-blue-600">{String(field.value)}</span>
                        </div>
                      ))}
                      {comparison.only_in_b.length > 5 && (
                        <p className="text-xs text-gray-500">
                          + {comparison.only_in_b.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Removed Fields */}
              {comparison.only_in_a.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-orange-600" />
                    Removed Fields ({comparison.only_in_a.length})
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {comparison.only_in_a.slice(0, 5).map((field) => (
                        <div key={field.field} className="flex justify-between text-sm">
                          <span className="font-mono text-gray-700">{field.field}</span>
                          <span className="text-orange-600 line-through">{String(field.value)}</span>
                        </div>
                      ))}
                      {comparison.only_in_a.length > 5 && (
                        <p className="text-xs text-gray-500">
                          + {comparison.only_in_a.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No comparison data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {resolutions.size > 0 ? (
                <span className="font-medium text-blue-600">
                  {resolutions.size} conflict{resolutions.size !== 1 ? 's' : ''} resolved
                </span>
              ) : (
                'Select resolutions for conflicts above'
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {resolutions.size > 0 && (
                <button
                  onClick={handleResolveAll}
                  disabled={resolving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {resolving ? 'Resolving...' : `Apply ${resolutions.size} Resolution${resolutions.size !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Conflict Card Component
interface ConflictCardProps {
  conflict: Conflict
  isExpanded: boolean
  onToggle: () => void
  resolution?: Resolution
  onResolve: (resolution: Resolution) => void
  getSeverityColor: (severity: string) => string
}

function ConflictCard({
  conflict,
  isExpanded,
  onToggle,
  resolution,
  onResolve,
  getSeverityColor
}: ConflictCardProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${getSeverityColor(conflict.severity)}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3 flex-1">
          <button className="p-1 hover:bg-white/50 rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium">{conflict.field}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                conflict.severity === 'high' ? 'bg-red-100 text-red-700' :
                conflict.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {conflict.severity}
              </span>
            </div>
            <p className="text-xs opacity-75">
              {conflict.source_a} vs {conflict.source_b}
            </p>
          </div>

          {resolution && (
            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              ✓ Resolved
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t bg-white">
          {/* Values Comparison */}
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{conflict.source_a}</p>
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm font-mono text-gray-900">{String(conflict.value_a)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">{conflict.source_b}</p>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-mono text-gray-900">{String(conflict.value_b)}</p>
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Choose Resolution:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onResolve({
                  field: conflict.field,
                  action: 'use_a',
                  value: conflict.value_a,
                  reasoning: `Use value from ${conflict.source_a}`
                })}
                className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                  resolution?.action === 'use_a'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium mb-1">Use {conflict.source_a}</div>
                <div className="text-xs opacity-75 font-mono truncate">{String(conflict.value_a)}</div>
              </button>
              <button
                onClick={() => onResolve({
                  field: conflict.field,
                  action: 'use_b',
                  value: conflict.value_b,
                  reasoning: `Use value from ${conflict.source_b}`
                })}
                className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                  resolution?.action === 'use_b'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-medium mb-1">Use {conflict.source_b}</div>
                <div className="text-xs opacity-75 font-mono truncate">{String(conflict.value_b)}</div>
              </button>
            </div>
          </div>

          {/* Resolution Status */}
          {resolution && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Resolution Selected</p>
                <p className="text-xs text-green-700">{resolution.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}