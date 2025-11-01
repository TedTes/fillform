'use client'
import { CheckSquare, Calendar } from 'lucide-react'
import { useState } from 'react'
import {
  Home,
  Upload,
  FolderPlus,
  FileText,
  FolderTree,
  Clock,
  GitCompare,
  Download,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  FileEdit
} from 'lucide-react'
import { type ComponentType, type SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
import QuickActions from '@/components/QuickActions'
import RecentActivity from '@/components/RecentActivity'

interface FileData {
  client?: string;
  name?: string;
  date?: string;
  confidence?: number;
}
// View types
export type ViewType = 
  | 'home'
  | 'upload'
  | 'files'
  | 'file-detail'
  | 'history'
  | 'compare'
  | 'export'

interface ViewState {
  type: ViewType
  data?: unknown // Context data for the view (e.g., file ID, client ID)
  breadcrumbs: string[]
}

interface MainLayoutProps {
  children?: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Current view state
  const [currentView, setCurrentView] = useState<ViewState>({
    type: 'home',
    breadcrumbs: ['Home']
  })

  // Navigation function
  const navigateTo = (type: ViewType, data?:unknown, breadcrumbs?: string[]) => {
    setCurrentView({
      type,
      data,
      breadcrumbs: breadcrumbs || [type.charAt(0).toUpperCase() + type.slice(1)]
    })
  }

  // Sidebar navigation items
  const navigationItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      onClick: () => navigateTo('home', undefined, ['Home'])
    },
    {
      id: 'files',
      label: 'Browse Files',
      icon: FolderTree,
      onClick: () => navigateTo('files', undefined, ['Home', 'Files'])
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      onClick: () => navigateTo('history', undefined, ['Home', 'History'])
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: GitCompare,
      onClick: () => navigateTo('compare', undefined, ['Home', 'Compare'])
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      onClick: () => navigateTo('export', undefined, ['Home', 'Export'])
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
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-xs text-gray-500">Shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarOpen ? (
            <div className="space-y-6">
             

              {/* Navigation */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  NAVIGATION
                </h3>
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentView.type === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  RECENT ACTIVITY
                </h3>
                <RecentActivity onNavigate={navigateTo} />
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
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title={item.label}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sidebar Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-xs text-gray-500">Shortcuts</p>
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
            <div className="p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    QUICK ACTIONS
                  </h3>
                  <QuickActions onNavigate={navigateTo} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    NAVIGATION
                  </h3>
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.onClick()
                            setMobileSidebarOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    RECENT ACTIVITY
                  </h3>
                  <RecentActivity onNavigate={navigateTo} />
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

                <div>
                  <h1 className="text-xl font-bold text-gray-900">AutoFil</h1>
                  <p className="text-xs text-gray-500">Smart Form Automation</p>
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

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center space-x-2 text-sm">
            {currentView.breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                <button
                  onClick={() => {
                    if (index === 0) navigateTo('home', undefined, ['Home'])
                  }}
                  className={`${
                    index === currentView.breadcrumbs.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {crumb}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Main View Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-fadeIn">
              {currentView.type === 'home' && <HomeView />}
              {currentView.type === 'upload' && <UploadView />}
              {currentView.type === 'files' && <FilesView onNavigate={navigateTo} />}
              {currentView.type === 'file-detail' && <FileDetailView data={currentView.data} />}
              {currentView.type === 'history' && <HistoryView />}
              {currentView.type === 'compare' && <CompareView />}
              {currentView.type === 'export' && <ExportView />}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// ========================================
// VIEW COMPONENTS
// ========================================

function HomeView() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Welcome to AutoFil</h2>
        <p className="text-blue-100 text-lg">
          Intelligent document processing with automated extraction, version control, and export capabilities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Submissions" value="0" color="blue" />
        <StatCard icon={TrendingUp} label="Avg Confidence" value="0%" color="green" />
        <StatCard icon={CheckSquare} label="Completed Today" value="0" color="purple" />
        <StatCard icon={Calendar} label="This Week" value="0" color="orange" />
      </div>

      {/* Feature Overview */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

function UploadView() {
  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-400 transition-colors">
        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
        <p className="text-sm text-gray-600 mb-6">
          Drag and drop your PDF files here, or click to browse
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Choose Files
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: PDF • Max size: 10MB per file
        </p>
      </div>
    </div>
  )
}

function FilesView({ onNavigate }: { onNavigate: (type: ViewType, data?: unknown, breadcrumbs?: string[]) => void }) {
  // Mock data
  const files = [
    { id: '1', name: 'ACORD_126.pdf', client: 'Client ABC', date: '2m ago', confidence: 95 },
    { id: '2', name: 'Application.pdf', client: 'Client XYZ', date: '15m ago', confidence: 88 }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Files</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Upload New
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 divide-y">
        {files.map((file) => (
          <button
            key={file.id}
            onClick={() => onNavigate('file-detail', file, ['Home', 'Files', file.name])}
            className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">{file.client} • {file.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-green-600">{file.confidence}%</span>
                <p className="text-xs text-gray-500">Confidence</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function FileDetailView({ data }: { data: unknown }) {
  const  fileData = data as FileData;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{  fileData?.name || 'File Details'}</h2>
            <p className="text-sm text-gray-600">{fileData?.client || 'Client'} • Uploaded {fileData?.date || 'recently'}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Edit
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export
            </button>
          </div>
        </div>

        <div className="aspect-[8.5/11] bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">PDF Preview</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Extraction Results</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Confidence Score</span>
            <span className="text-sm font-medium text-green-600">{fileData?.confidence || 0}%</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-sm text-gray-600">Fields Extracted</span>
            <span className="text-sm font-medium text-gray-900">24</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-600">Status</span>
            <span className="text-sm font-medium text-blue-600">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HistoryView() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <Clock className="w-16 h-16 text-orange-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Version History</h2>
      <p className="text-gray-600">Track all changes with comprehensive audit trail</p>
    </div>
  )
}

function CompareView() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <GitCompare className="w-16 h-16 text-red-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Compare Documents</h2>
      <p className="text-gray-600">Compare data sources and resolve conflicts</p>
    </div>
  )
}

function ExportView() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <Download className="w-16 h-16 text-teal-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h2>
      <p className="text-gray-600">Export data in multiple formats or send to external systems</p>
    </div>
  )
}

// Helper Components
function StatCard({ icon: Icon, label, value, color }: {icon:IconComponent,label:string, value: string, color:string}) {
  const colors:Record<string,string>= {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600'
  }
  return (
    <div className={`${colors[color]} border rounded-lg p-6`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )
}

function FeatureCard({ title, description, features, badge }: {title:string, description: string, features:string[], badge:string}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
          {badge}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

