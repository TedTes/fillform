/**
 * Folder panel - left sidebar container.
 */

'use client'

import { Folder } from '@/types/folder'
import FolderList from './FolderList'

interface FolderPanelProps {
  folders: Folder[]
  activeFolder: Folder
  onFolderClick: (folder: Folder) => void
  onNewFolder: () => void
}

export default function FolderPanel({
  folders,
  activeFolder,
  onFolderClick,
  onNewFolder,
}: FolderPanelProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Folders
          </h2>
          <button
            onClick={onNewFolder}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            + New
          </button>
        </div>

        {/* Folder List */}
        <FolderList
          folders={folders}
          activeFolder={activeFolder}
          onFolderClick={onFolderClick}
        />
      </div>
    </aside>
  )
}