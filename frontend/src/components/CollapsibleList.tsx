/**
 * Collapsible list component for showing more/less items.
 */

'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleListProps {
  isExpanded: boolean
  onToggle: () => void
  hiddenCount: number
}

export default function CollapsibleList({
  isExpanded,
  onToggle,
  hiddenCount,
}: CollapsibleListProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full mt-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="w-4 h-4" />
          Show Less
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4" />
          Show {hiddenCount} More
        </>
      )}
    </button>
  )
}