/**
 * Folder list component - with empty state.
 */

'use client'

import { Folder } from '@/types/folder'
import FolderItem from './FolderItem'
import EmptyState from './EmptyState'

interface FolderListProps {
  folders: Folder[]
  activeFolder: Folder
  onFolderClick: (folder: Folder) => void
}

export default function FolderList({
  folders,
  activeFolder,
  onFolderClick,
}: FolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="mb-3 text-gray-400">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">No folders yet</p>
        <p className="text-xs text-gray-500">Click "+ New" to create one</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          isActive={activeFolder.id === folder.id}
          onClick={() => onFolderClick(folder)}
        />
      ))}
    </div>
  )
}