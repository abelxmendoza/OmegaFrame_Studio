'use client'

import { useAppSelector } from '@/redux/hooks'
import type { Job } from '@/redux/jobSlice'

interface JobProgressProps {
  jobId: string | null
  className?: string
  showMessage?: boolean
}

export default function JobProgress({ jobId, className = '', showMessage = true }: JobProgressProps) {
  const job = useAppSelector((state) => (jobId ? state.jobs[jobId] : null))

  if (!jobId || !job) {
    return null
  }

  const progress = job.progress || 0
  const status = job.status || 'queued'
  const message = job.message || ''

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'running':
        return 'bg-omega-accent'
      default:
        return 'bg-omega-text/30'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'queued':
        return 'Queued'
      case 'running':
        return `${progress}%`
      case 'success':
        return 'Completed'
      case 'error':
        return 'Failed'
      default:
        return ''
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress bar */}
      <div className="w-full bg-omega-bg rounded-full h-2 overflow-hidden">
        <div
          className={`${getStatusColor()} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${
          status === 'success' ? 'text-green-400' :
          status === 'error' ? 'text-red-400' :
          status === 'running' ? 'text-omega-accent' :
          'text-omega-text/60'
        }`}>
          {getStatusText()}
        </span>
        {showMessage && message && (
          <span className="text-omega-text/50 truncate ml-2">{message}</span>
        )}
      </div>
    </div>
  )
}
