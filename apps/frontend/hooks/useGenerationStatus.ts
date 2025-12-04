'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { checkVideoStatus } from '@/lib/api'
import { categorizeError, logError } from '@/lib/retry'

export interface GenerationStatus {
  status: 'processing' | 'completed' | 'failed' | 'error' | 'timeout'
  progress?: number
  video_url?: string
  url?: string
  error?: string
  message?: string
  job_id?: string
}

interface UseGenerationStatusOptions {
  jobId: string | null
  provider: 'pika' | 'runway'
  enabled?: boolean
  pollInterval?: number // milliseconds
  maxAttempts?: number
  onComplete?: (result: GenerationStatus) => void
  onError?: (error: GenerationStatus) => void
}

export function useGenerationStatus({
  jobId,
  provider,
  enabled = true,
  pollInterval = 3000, // 3 seconds
  maxAttempts = 60, // 3 minutes max
  onComplete,
  onError,
}: UseGenerationStatusOptions) {
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const attemptCount = useRef(0)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const poll = useCallback(async () => {
    if (!jobId || !enabled) {
      setIsPolling(false)
      return
    }

    if (attemptCount.current >= maxAttempts) {
      setStatus({
        status: 'timeout',
        error: 'Polling timed out after maximum attempts',
        job_id: jobId,
      })
      setIsPolling(false)
      if (onError) {
        onError({
          status: 'timeout',
          error: 'Polling timed out',
          job_id: jobId,
        })
      }
      return
    }

    try {
      const result = await checkVideoStatus(jobId, provider)
      attemptCount.current += 1

      setStatus(result)

      if (result.status === 'completed') {
        setIsPolling(false)
        if (onComplete) {
          onComplete(result)
        }
        return
      }

      if (result.status === 'failed' || result.status === 'error') {
        setIsPolling(false)
        if (onError) {
          onError(result)
        }
        return
      }

      // Still processing, continue polling
      if (result.status === 'processing') {
        pollTimeoutRef.current = setTimeout(() => {
          poll()
        }, pollInterval)
      }
    } catch (error: any) {
      logError('useGenerationStatus', error, { jobId, provider, attempt: attemptCount.current })
      attemptCount.current += 1

      const errorInfo = categorizeError(error)
      
      // Retry on retryable errors (up to max attempts)
      if (attemptCount.current < maxAttempts && errorInfo.retryable) {
        pollTimeoutRef.current = setTimeout(() => {
          poll()
        }, pollInterval)
      } else {
        const errorMessage = error.userMessage || errorInfo.message || 'Failed to check status'
        setStatus({
          status: 'error',
          error: errorMessage,
          job_id: jobId,
        })
        setIsPolling(false)
        if (onError) {
          onError({
            status: 'error',
            error: errorMessage,
            job_id: jobId,
          })
        }
      }
    }
  }, [jobId, provider, enabled, pollInterval, maxAttempts, onComplete, onError])

  useEffect(() => {
    if (jobId && enabled) {
      attemptCount.current = 0
      setIsPolling(true)
      poll()
    } else {
      setIsPolling(false)
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [jobId, enabled, poll])

  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      pollTimeoutRef.current = null
    }
    setIsPolling(false)
  }, [])

  return {
    status,
    isPolling,
    stopPolling,
    progress: status?.progress ?? 0,
  }
}

