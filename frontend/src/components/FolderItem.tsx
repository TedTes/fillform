/**
 * Single folder item component
 */

'use client'

import { Folder } from '@/types/folder'

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
        group
        w-full text-left px-3 py-3 rounded-lg 
        transition-all duration-200
        ${
          isActive
            ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
            : 'text-gray-700 border border-transparent hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {/* Folder Icon */}
        <span className={`text-xl flex-shrink-0 transition-transform duration-200 ${
          isActive ? 'scale-110' : 'group-hover:scale-105'
        }`}>
          📁
        </span>

        {/* Folder Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate transition-colors ${
            isActive ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-950'
          }`}>
            {folder.name}
          </p>
          <p className={`text-xs mt-0.5 transition-colors ${
            isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
          }`}>
            {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
          </p>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></div>
        )}
      </div>
    </button>
  )
}