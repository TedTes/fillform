/**
 * Folder panel component - clean design without borders
 */

'use client'

import { Folder } from '@/types/folder'
import FolderList from './FolderList'
import { X, FolderPlus } from 'lucide-react'

interface FolderPanelProps {
  folders: Folder[]
  activeFolder: Folder
  onFolderClick: (folder: Folder) => void
  onNewFolder: () => void
  isMobileOpen: boolean
  onMobileToggle: () => void
}

export default function FolderPanel({
  folders,
  activeFolder,
  onFolderClick,
  onNewFolder,
  isMobileOpen,
  onMobileToggle,
}: FolderPanelProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar - NO RIGHT BORDER */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-white
          flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Spacing */}
        <div className="h-10 bg-white"></div>

        {/* New Folder Button Section - NO BORDER */}
        <div className="px-4 py-4 bg-white">
          {/* Mobile Close Button */}
          <button
            onClick={onMobileToggle}
            className="lg:hidden absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* New Folder Button - Right Aligned */}
          <div className="flex justify-end">
            <button
              onClick={onNewFolder}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-blue-500 text-gray-700 hover:text-gray-900 text-xs font-medium rounded-md transition-all duration-200"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Space Between Button and Folder List */}
        <div className="h-4 bg-white"></div>

        {/* Folder List */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-2">
            <FolderList
              folders={folders}
              activeFolder={activeFolder}
              onFolderClick={(folder) => {
                onFolderClick(folder)
                onMobileToggle()
              }}
            />
          </div>
        </div>

        {/* Footer - NO TOP BORDER */}
        <div className="px-4 py-3 bg-white">
          <p className="text-xs text-gray-500 text-center">
            {folders.length} folder{folders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </aside>
    </>
  )
}