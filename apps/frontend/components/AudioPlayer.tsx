'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'

interface AudioPlayerProps {
  projectId: string
}

export default function AudioPlayer({ projectId }: AudioPlayerProps) {
  const { currentProject } = useAppSelector((state) => state.project)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // In a real app, this would fetch the actual audio URL from the project
  const audioUrl = currentProject?.script
    ? `/api/project/${projectId}/audio`
    : null

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false))
      return () => audio.removeEventListener('ended', () => setIsPlaying(false))
    }
  }, [])

  if (!audioUrl) {
    return (
      <div className="text-sm text-omega-text/60 p-4 bg-omega-bg border border-omega-border rounded-md">
        No audio generated yet. Generate voice from script first.
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-omega-bg border border-omega-border rounded-md">
      <button
        onClick={togglePlay}
        className="w-10 h-10 bg-omega-accent hover:bg-omega-accent/90 text-white rounded-full flex items-center justify-center transition-all shadow-omega-glow"
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <div className="flex-1">
        <div className="w-full bg-omega-panel rounded-full h-2 border border-omega-border">
          <div className="bg-omega-accent h-2 rounded-full shadow-omega-glow" style={{ width: '0%' }} />
        </div>
      </div>
      <audio ref={audioRef} src={audioUrl} />
    </div>
  )
}

