/**
 * Collapsible list component
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
      className="
        group
        w-full mt-4 px-4 py-3 
        bg-white hover:bg-gray-50 
        border border-gray-200 hover:border-gray-300
        rounded-lg 
        shadow-sm hover:shadow-md
        transition-all duration-200
        flex items-center justify-center gap-2 
        text-sm font-medium text-gray-700 hover:text-gray-900
      "
    >
      {isExpanded ? (
        <>
          <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          Show Less
        </>
      ) : (
        <>
          <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          Show {hiddenCount} More
        </>
      )}
    </button>
  )
}