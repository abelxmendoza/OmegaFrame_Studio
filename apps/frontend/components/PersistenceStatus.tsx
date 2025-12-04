'use client'

import { useEffect, useState } from 'react'

interface PersistenceStatusProps {
  enabled: boolean
  isInitialLoad?: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  showMock?: boolean
  className?: string
}

export default function PersistenceStatus({
  enabled,
  isInitialLoad = false,
  isSaving = false,
  lastSaved = null,
  showMock = false,
  className = '',
}: PersistenceStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')

  // Update time ago every few seconds
  useEffect(() => {
    if (!lastSaved) {
      setTimeAgo('')
      return
    }

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      
      if (seconds < 5) {
        setTimeAgo('just now')
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        setTimeAgo(`${minutes}m ago`)
      } else {
        const hours = Math.floor(seconds / 3600)
        setTimeAgo(`${hours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 5000)
    return () => clearInterval(interval)
  }, [lastSaved])

  // Mock mode - show fake saving states
  const [mockSaving, setMockSaving] = useState(false)
  const [mockLastSaved, setMockLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (showMock && !enabled) {
      // Set initial mock save immediately
      setMockLastSaved(new Date())
      
      // Simulate periodic saves every 3-4 seconds
      const interval = setInterval(() => {
        setMockSaving(true)
        setTimeout(() => {
          setMockSaving(false)
          setMockLastSaved(new Date())
        }, 600 + Math.random() * 400) // Random delay between 600-1000ms
      }, 3000 + Math.random() * 1000) // Random interval between 3-4 seconds

      return () => clearInterval(interval)
    } else if (!showMock && !enabled) {
      // Reset mock state when not in mock mode
      setMockSaving(false)
      setMockLastSaved(null)
    }
  }, [showMock, enabled])

  const displaySaving = showMock ? mockSaving : isSaving
  const displayLastSaved = showMock ? mockLastSaved : lastSaved

  if (!enabled && !showMock) {
    return null
  }

  if (isInitialLoad) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="w-2 h-2 bg-omega-accent/50 rounded-full animate-pulse" />
        <span className="text-omega-text/60">Loading...</span>
      </div>
    )
  }

  if (displaySaving) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="relative">
          <div className="w-2 h-2 bg-omega-accent rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-omega-accent rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-omega-text/70 font-medium">Saving...</span>
      </div>
    )
  }

  if (displayLastSaved) {
    const seconds = Math.floor((Date.now() - displayLastSaved.getTime()) / 1000)
    const timeText = 
      seconds < 5 ? 'just now' : 
      seconds < 60 ? `${seconds}s ago` : 
      seconds < 3600 ? `${Math.floor(seconds / 60)}m ago` : 
      `${Math.floor(seconds / 3600)}h ago`
    
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/50" />
        <span className="text-omega-text/60">
          Saved {timeText}
          {showMock && !enabled && (
            <span className="text-omega-text/40 ml-1" title="Mock mode - Supabase not configured">
              (mock)
            </span>
          )}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <div className="w-2 h-2 bg-omega-text/20 rounded-full" />
      <span className="text-omega-text/50">Not saved</span>
    </div>
  )
}
