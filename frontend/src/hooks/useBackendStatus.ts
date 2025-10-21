/**
 * Hook to check backend availability.
 */

'use client'

import { useEffect, useState } from 'react'
import { checkBackendAvailability } from '@/lib/api-client'

export function useBackendStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [message, setMessage] = useState<string>('')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    async function checkStatus() {
      try {
        const result = await checkBackendAvailability()
        if (mounted) {
          setIsAvailable(result.available)
          setMessage(result.message)
        }
      } catch (error) {
        if (mounted) {
          setIsAvailable(false)
          setMessage('Error checking backend status')
        }
      } finally {
        if (mounted) {
          setIsChecking(false)
        }
      }
    }

    checkStatus()

    return () => {
      mounted = false
    }
  }, [])

  return { isAvailable, message, isChecking }
}