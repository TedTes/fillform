'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Edit, Download, Clock } from 'lucide-react'

interface Activity {
  id: string
  type: 'upload' | 'extract' | 'edit' | 'fill' | 'export'
  description: string
  timestamp: string
  metadata?: {
    filename?: string
    confidence?: number
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Mock data - replace with actual API call
    setActivities([
      {
        id: '1',
        type: 'upload',
        description: 'Uploaded ACORD_126.pdf',
        timestamp: new Date().toISOString(),
        metadata: { filename: 'ACORD_126.pdf' }
      },
      {
        id: '2',
        type: 'extract',
        description: 'Extracted data with 95% confidence',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        metadata: { confidence: 0.95 }
      },
      {
        id: '3',
        type: 'edit',
        description: 'Updated applicant information',
        timestamp: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: '4',
        type: 'fill',
        description: 'Filled PDF successfully',
        timestamp: new Date(Date.now() - 180000).toISOString()
      },
      {
        id: '5',
        type: 'export',
        description: 'Exported 3 submissions to CSV',
        timestamp: new Date(Date.now() - 240000).toISOString()
      }
    ])
  }, [])

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4" />
      case 'extract':
        return <FileText className="w-4 h-4" />
      case 'edit':
        return <Edit className="w-4 h-4" />
      case 'fill':
        return <FileText className="w-4 h-4" />
      case 'export':
        return <Download className="w-4 h-4" />
    }
  }

  const getColor = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'text-blue-600 bg-blue-50'
      case 'extract':
        return 'text-green-600 bg-green-50'
      case 'edit':
        return 'text-purple-600 bg-purple-50'
      case 'fill':
        return 'text-orange-600 bg-orange-50'
      case 'export':
        return 'text-teal-600 bg-teal-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.map(activity => (
          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No recent activity</p>
        </div>
      )}
    </div>
  )
}