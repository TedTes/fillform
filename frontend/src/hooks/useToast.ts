/**
 * Toast hook for easy access.
 */

import { useToast as useToastContext } from '@/contexts/ToastContext'

export function useToast() {
  const { showToast } = useToastContext()

  return {
    success: (message: string) => showToast('success', message),
    error: (message: string) => showToast('error', message),
    info: (message: string) => showToast('info', message),
    warning: (message: string) => showToast('warning', message),
  }
}

export default useToast