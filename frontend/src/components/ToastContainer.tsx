/**
 * Toast container - renders all active toasts.
 */

'use client'

import { useToast as useToastContext } from '@/contexts/ToastContext'
import Toast from './Toast'

export default function ToastContainer() {
  const { toasts, hideToast } = useToastContext()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}