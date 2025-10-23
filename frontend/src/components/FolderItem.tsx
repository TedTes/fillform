/**
 * Single folder item component - enhanced visual design.
 */

'use client'

import { Folder } from '@/types/folder'
import { Folder as FolderIcon, ChevronRight } from 'lucide-react'

interface FolderItemProps {
  folder: Folder
  isActive: boolean
  onClick: () => void
}

export default function FolderItem({ folder, isActive, onClick }: FolderItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
        transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 border-2 border-blue-100'
            : 'bg-white border-2 border-transparent hover:border-gray-200 hover:bg-gray-50'
        }
      `}
    >
      {/* Folder Icon - SMALLER */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          transition-colors duration-200
          ${isActive ? 'bg-blue-100' : 'bg-gray-50'}
        `}
      >
        <FolderIcon
          className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
          fill={isActive ? 'currentColor' : 'none'}
        />
      </div>

      {/* Folder Info - SMALLER TEXT */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className={`
            text-sm font-medium truncate transition-colors
            ${isActive ? 'text-gray-900' : 'text-gray-700'}
          `}
        >
          {folder.name}
        </p>
        <p className="text-xs text-gray-500">
          {folder.file_count} file{folder.file_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Arrow Indicator */}
      {isActive && (
        <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
      )}
    </button>
  )
}