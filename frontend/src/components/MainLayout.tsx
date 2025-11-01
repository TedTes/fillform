'use client'

import { useState,type ComponentType, type SVGProps } from 'react'
import {
  FolderTree,
  Upload,
  FileEdit,
  Clock,
  GitCompare,
  Download,
  Settings,
  HelpCircle,
  TrendingUp,
  CheckSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'


import QuickActions from '@/components/QuickActions'
import RecentActivity from '@/components/RecentActivity'


export type TabId = 'overview' | 'folders' | 'upload' | 'submissions' | 'history' | 'compare' | 'export'
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;


export default function MainLayout({ children }: {children?: React.ReactNode}) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const tabs = [
    {
      id: 'overview' as TabId,
      label: 'Overview',
      icon: TrendingUp,
      description: 'Dashboard with quick actions'
    },
    {
      id: 'folders' as TabId,
      label: 'Folders',
      icon: FolderTree,
      description: 'Organize clients and submissions'
    },
    {
      id: 'upload' as TabId,
      label: 'Upload',
      icon: Upload,
      description: 'Upload and extract documents'
    },
    {
      id: 'submissions' as TabId,
      label: 'Submissions',
      icon: FileEdit,
      description: 'Edit and fill forms'
    },
    {
      id: 'history' as TabId,
      label: 'History',
      icon: Clock,
      description: 'View version history'
    },
    {
      id: 'compare' as TabId,
      label: 'Compare',
      icon: GitCompare,
      description: 'Compare and resolve conflicts'
    },
    {
      id: 'export' as TabId,
      label: 'Export',
      icon: Download,
      description: 'Export and send data'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Collapsible Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-16'}
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                <p className="text-xs text-gray-600">Shortcuts</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarOpen ? (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <QuickActions />
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Recent Activity
                </h3>
                <RecentActivity />
              </div>
            </div>
          ) : (
            // Collapsed sidebar - show icons only
            <div className="space-y-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Quick Actions"
              >
                <TrendingUp className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Recent Activity"
              >
                <Clock className="w-5 h-5 mx-auto" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              B1-B12 Features Active
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sidebar Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-xs text-gray-600">Shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Sidebar Content */}
            <div className="overflow-y-auto p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Actions
                  </h3>
                  <QuickActions />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Recent Activity
                  </h3>
                  <RecentActivity />
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center lg:hidden">
                    <FileEdit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900">AutoFil</h1>
                    <p className="text-xs text-gray-600 hidden sm:block">Smart Form Automation</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <HelpCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {tab.description}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-fadeIn">
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'folders' && <FoldersTab />}
              {activeTab === 'upload' && <UploadTab />}
              {activeTab === 'submissions' && <SubmissionsTab />}
              {activeTab === 'history' && <HistoryTab />}
              {activeTab === 'compare' && <CompareTab />}
              {activeTab === 'export' && <ExportTab />}
            </div>
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <p>© 2025 AutoFil. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-gray-900 transition-colors">Documentation</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ========================================
// TAB COMPONENTS
// ========================================

function OverviewTab() {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to AutoFil</h2>
        <p className="text-blue-100 text-lg">
          Intelligent document processing with automated extraction, version control, and export capabilities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileEdit} label="Total Submissions" value="0" color="blue" />
        <StatCard icon={TrendingUp} label="Avg Confidence" value="0%" color="green" />
        <StatCard icon={CheckSquare} label="Completed Today" value="0" color="purple" />
        <StatCard icon={Calendar} label="This Week" value="0" color="orange" />
      </div>

      {/* Feature Overview Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureCard
            title="Folder Management"
            description="Organize clients and submissions hierarchically"
            features={['Two-level structure', 'Templates', 'Context enforcement']}
            badge="B1-B4"
          />
          <FeatureCard
            title="Smart Extraction"
            description="Automatic data extraction with confidence scoring"
            features={['Real-time progress', 'Low confidence filter', 'Inline guidance']}
            badge="B5-B7"
          />
          <FeatureCard
            title="Version Control"
            description="Track changes with complete audit trail"
            features={['Auto versioning', 'Compare & rollback', 'Change tracking']}
            badge="B8"
          />
          <FeatureCard
            title="Conflict Resolution"
            description="Compare data and resolve conflicts"
            features={['Side-by-side view', 'Smart suggestions', 'Batch resolution']}
            badge="B9"
          />
          <FeatureCard
            title="Dynamic Forms"
            description="Context-aware form generation"
            features={['Template-based', 'Smart validation', 'Pre-population']}
            badge="B10"
          />
          <FeatureCard
            title="Export & API"
            description="Multiple export formats and webhooks"
            features={['CSV, JSON, ZIP', 'Webhook integration', 'Batch export']}
            badge="B11"
          />
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatCard({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: IconComponent
  label: string
  value: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className={`${colors[color]} rounded-lg p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  features,
  badge
}: {
  title: string
  description: string
  features: string[]
  badge: string
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
          {badge}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature, idx) => (
          <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
            <CheckSquare className="w-3 h-3 text-green-600" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Other Tab Components (keep as before)
function FoldersTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <FolderTree className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Folder Management</h2>
        <p className="text-gray-600 mb-6">
          Organize your clients and submissions in a hierarchical structure
        </p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-700">B1:</strong> Client → Submission hierarchy with two-level folders
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-700">B2:</strong> Submission templates (Property, WC, GL, Custom)
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-700">B3:</strong> Context enforcement - no orphan files
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-700">B4:</strong> Two-way sync with badges showing file count and status
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function UploadTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <Upload className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload & Extract</h2>
        <p className="text-gray-600 mb-6">Upload documents for automatic data extraction</p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-green-700">B5:</strong> Auto-extract with real-time progress and confidence scores
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-green-700">B6:</strong> Low confidence field filter for quality control
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-green-700">B7:</strong> Inline extraction guidance with hints and suggestions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmissionsTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <FileEdit className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Submissions</h2>
        <p className="text-gray-600 mb-6">Review, edit, and fill extracted data</p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-purple-700">B10:</strong> Context-aware dynamic forms based on templates
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-purple-700">Features:</strong> Smart validation, help text, conditional fields, pre-populated data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Version History</h2>
        <p className="text-gray-600 mb-6">Track all changes with comprehensive audit trail</p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-orange-700">B8:</strong> Automatic versioning on every change
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-orange-700">Features:</strong> Compare versions, rollback capability, change tracking, audit trail
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <GitCompare className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Comparison</h2>
        <p className="text-gray-600 mb-6">Compare data sources and resolve conflicts</p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-red-700">B9:</strong> Side-by-side comparison with conflict detection
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-red-700">Features:</strong> Smart resolution suggestions, visual diff, batch conflict resolution
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExportTab() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
      <div className="text-center">
        <Download className="w-16 h-16 text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Export & Send</h2>
        <p className="text-gray-600 mb-6">Export data in multiple formats or send to external systems</p>
        <div className="text-left max-w-2xl mx-auto space-y-3">
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-teal-700">B11:</strong> Export to CSV, JSON, or complete ZIP packages
            </p>
          </div>
          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong className="text-teal-700">Features:</strong> Webhook integration, batch selection, statistics dashboard, API automation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}