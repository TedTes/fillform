/**
 * Toast notification component.
 */

'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'
import { Toast as ToastType } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onClose: () => void
}

export default function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Start exit animation before removal
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true)
      }, toast.duration - 300)

      return () => clearTimeout(exitTimer)
    }
  }, [toast.duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 300)
  }

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  }

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[toast.type]

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${bgColor} ${borderColor}
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />

      {/* Message */}
      <p className={`text-sm font-medium flex-1 ${textColor}`}>
        {toast.message}
      </p>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={`flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors ${textColor}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}