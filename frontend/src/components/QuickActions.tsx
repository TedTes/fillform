'use client'

import {
  Upload,
  FolderPlus,
  FileText,
  Download,
  Zap
} from 'lucide-react'

export default function QuickActions() {
  const actions = [
    {
      icon: Upload,
      label: 'Upload Document',
      description: 'Extract data from PDF',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Upload')
    },
    {
      icon: FolderPlus,
      label: 'New Folder',
      description: 'Create client folder',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('New Folder')
    },
    {
      icon: FileText,
      label: 'New Submission',
      description: 'Start from template',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('New Submission')
    },
    {
      icon: Download,
      label: 'Export All',
      description: 'Download package',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('Export')
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => {
        const Icon = action.icon
        
        return (
          <button
            key={idx}
            onClick={action.action}
            className={`${action.color} text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Icon className="w-6 h-6" />
              <Zap className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
            <p className="text-sm text-white/80">{action.description}</p>
          </button>
        )
      })}
    </div>
  )
}