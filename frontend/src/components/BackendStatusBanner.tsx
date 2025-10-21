/**
 * Backend status banner - shows if backend is unavailable.
 */

'use client'

import { useBackendStatus } from '@/hooks/useBackendStatus'
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react'

export default function BackendStatusBanner() {
  const { isAvailable, message, isChecking } = useBackendStatus()

  // Don't show anything while checking or if available
  if (isChecking || isAvailable) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="w-4 h-4 text-yellow-600" />
        <p className="text-yellow-800 font-medium">
          Backend not available: {message}
        </p>
        <p className="text-yellow-600 text-xs">
          (Using mock data for now)
        </p>
      </div>
    </div>
  )
}