'use client'

import { 
  FileText, 
  ClipboardList, 
  Building2, 
  DollarSign, 
  FileImage, 
  File,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentTypeBadgeProps {
  documentType: string
  confidence?: number
  size?: 'sm' | 'md' | 'lg'
  showConfidence?: boolean
  showIcon?: boolean
  className?: string
}

// Document type configurations
const DOCUMENT_TYPE_CONFIG: Record<string, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof FileText
}> = {
  'acord_125': {
    label: 'ACORD 125',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: FileText,
  },
  'acord_126': {
    label: 'ACORD 126',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: FileText,
  },
  'acord_130': {
    label: 'ACORD 130',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: FileText,
  },
  'acord_140': {
    label: 'ACORD 140',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: FileText,
  },
  'loss_run': {
    label: 'Loss Run',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: ClipboardList,
  },
  'sov': {
    label: 'Schedule of Values',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Building2,
  },
  'financial_statement': {
    label: 'Financial Statement',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: DollarSign,
  },
  'supplemental': {
    label: 'Supplemental',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: FileImage,
  },
  'generic': {
    label: 'Document',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: File,
  },
  'unknown': {
    label: 'Unknown',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: HelpCircle,
  },
}

export default function DocumentTypeBadge({
  documentType,
  confidence,
  size = 'md',
  showConfidence = true,
  showIcon = true,
  className,
}: DocumentTypeBadgeProps) {
  // Get config for document type (fallback to unknown)
  const config = DOCUMENT_TYPE_CONFIG[documentType.toLowerCase()] || DOCUMENT_TYPE_CONFIG['unknown']
  const Icon = config.icon

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs',
      confidence: 'text-[10px]',
    },
    md: {
      container: 'px-2.5 py-1.5 gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm',
      confidence: 'text-xs',
    },
    lg: {
      container: 'px-3 py-2 gap-2',
      icon: 'w-5 h-5',
      text: 'text-base',
      confidence: 'text-sm',
    },
  }

  const sizes = sizeClasses[size]

  // Confidence color
  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'text-green-600'
    if (conf >= 0.6) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        config.bgColor,
        config.borderColor,
        sizes.container,
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(sizes.icon, config.color)} />
      )}
      
      <span className={cn(sizes.text, config.color)}>
        {config.label}
      </span>

      {showConfidence && confidence !== undefined && (
        <>
          <span className={cn('font-normal', config.color, sizes.text)}>•</span>
          <span className={cn(
            'font-semibold',
            sizes.confidence,
            getConfidenceColor(confidence)
          )}>
            {Math.round(confidence * 100)}%
          </span>
        </>
      )}
    </div>
  )
}

// Variant: Compact badge (icon only with tooltip)
interface CompactDocumentBadgeProps {
  documentType: string
  confidence?: number
  className?: string
}

export function CompactDocumentBadge({
  documentType,
  confidence,
  className,
}: CompactDocumentBadgeProps) {
  const config = DOCUMENT_TYPE_CONFIG[documentType.toLowerCase()] || DOCUMENT_TYPE_CONFIG['unknown']
  const Icon = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-8 h-8 rounded-md border',
        config.bgColor,
        config.borderColor,
        className
      )}
      title={`${config.label}${confidence ? ` (${Math.round(confidence * 100)}%)` : ''}`}
    >
      <Icon className={cn('w-4 h-4', config.color)} />
    </div>
  )
}

// Variant: Badge with status indicator
interface DocumentBadgeWithStatusProps {
  documentType: string
  confidence?: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  className?: string
}

export function DocumentBadgeWithStatus({
  documentType,
  confidence,
  status,
  className,
}: DocumentBadgeWithStatusProps) {
  const config = DOCUMENT_TYPE_CONFIG[documentType.toLowerCase()] || DOCUMENT_TYPE_CONFIG['unknown']
  const Icon = config.icon

  const statusConfig = {
    pending: { color: 'bg-gray-400', label: 'Pending' },
    processing: { color: 'bg-blue-400 animate-pulse', label: 'Processing' },
    completed: { color: 'bg-green-500', label: 'Completed' },
    error: { color: 'bg-red-500', label: 'Error' },
  }

  const statusInfo = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1.5 font-medium rounded-md border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn('w-4 h-4', config.color)} />
      
      <span className={cn('text-sm', config.color)}>
        {config.label}
      </span>

      {confidence !== undefined && (
        <>
          <span className={cn('font-normal text-sm', config.color)}>•</span>
          <span className="text-xs font-semibold text-gray-600">
            {Math.round(confidence * 100)}%
          </span>
        </>
      )}

      <div
        className={cn('w-2 h-2 rounded-full', statusInfo.color)}
        title={statusInfo.label}
      />
    </div>
  )
}