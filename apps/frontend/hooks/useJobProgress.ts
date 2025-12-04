'use client'

import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { connectJobSocket } from '@/lib/ws/jobSocket'
import type { Job } from '@/redux/jobSlice'

interface UseJobProgressOptions {
  jobId: string | null
  onComplete?: (result: any) => void
  onError?: (error: string) => void
}

export function useJobProgress({ jobId, onComplete, onError }: UseJobProgressOptions) {
  const job = useAppSelector((state) => (jobId ? state.jobs[jobId] : null))
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!jobId) return

    // Connect WebSocket
    wsRef.current = connectJobSocket(jobId)

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [jobId])

  // Handle completion
  useEffect(() => {
    if (job?.status === 'success' && onComplete) {
      onComplete(job.result)
    }
  }, [job?.status, job?.result, onComplete])

  // Handle errors
  useEffect(() => {
    if (job?.status === 'error' && onError) {
      onError(job.message || 'Job failed')
    }
  }, [job?.status, job?.message, onError])

  return {
    job: job as Job | null,
    progress: job?.progress || 0,
    status: job?.status || 'queued',
    message: job?.message,
  }
}
