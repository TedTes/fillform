/**
 * Folder panel 
 */

'use client'

import { Folder } from '@/types/folder'
import { Menu, X } from 'lucide-react'
import FolderList from './FolderList'

interface FolderPanelProps {
  folders: Folder[]
  activeFolder: Folder
  onFolderClick: (folder: Folder) => void
  onNewFolder: () => void
  isMobileOpen?: boolean
  onMobileToggle?: () => void
}

export default function FolderPanel({
  folders,
  activeFolder,
  onFolderClick,
  onNewFolder,
  isMobileOpen = false,
  onMobileToggle,
}: FolderPanelProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Folders
            </h2>
            <button
              onClick={onMobileToggle}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between mb-4">
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

          {/* Mobile New Folder Button */}
          <button
            onClick={() => {
              onNewFolder()
              onMobileToggle?.()
            }}
            className="w-full mb-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors lg:hidden"
          >
            + New Folder
          </button>

          {/* Folder List */}
          <FolderList
            folders={folders}
            activeFolder={activeFolder}
            onFolderClick={(folder) => {
              onFolderClick(folder)
              onMobileToggle?.() // Close drawer on mobile after selection
            }}
          />
        </div>
      </aside>
    </>
  )
}