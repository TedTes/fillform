/**
 * Folder list component.
 */

'use client'

import { Folder } from '@/types/folder'
import FolderItem from './FolderItem'

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
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No folders yet</p>
        <p className="text-xs text-gray-400 mt-1">Click "+ New" to create one</p>
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