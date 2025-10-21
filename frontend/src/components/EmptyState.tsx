/**
 * Reusable empty state component.
 */

'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 lg:p-12 text-center">
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="mb-4 text-gray-400">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 max-w-sm">
            {description}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}