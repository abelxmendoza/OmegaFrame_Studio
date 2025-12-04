'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoModalProps {
  videoUrl: string
  thumbnail?: string
  title?: string
  onClose: () => void
}

export default function VideoModal({ videoUrl, thumbnail, title, onClose }: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Construct full URL
  const pythonRenderUrl = process.env.NEXT_PUBLIC_PYTHON_RENDER_URL || 'http://localhost:8000'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  const getFullUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    if (url.startsWith('/renders/') || url.startsWith('/clips/')) {
      return `${pythonRenderUrl}${url}`
    }
    if (supabaseUrl && url.includes('supabase.co')) {
      return url
    }
    return `${pythonRenderUrl}/${url}`
  }

  const fullVideoUrl = getFullUrl(videoUrl)
  const fullThumbnailUrl = thumbnail ? getFullUrl(thumbnail) : undefined

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (video) {
      const newTime = (parseFloat(e.target.value) / 100) * duration
      video.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    const newVolume = parseFloat(e.target.value)
    if (video) {
      video.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(fullVideoUrl)
      if (!response.ok) throw new Error('Failed to fetch video')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading video:', error)
      alert('Failed to download video. Please try again.')
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === modalRef.current) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-6xl bg-omega-panel border border-omega-border rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-omega-border bg-omega-panel/95 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-omega-text flex items-center gap-2">
            <span>🎬</span>
            <span>{title || 'Video Preview'}</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-omega-accent hover:bg-omega-accent/90 text-white text-sm rounded transition-all flex items-center gap-1.5 shadow-omega-glow hover:shadow-omega-glow-lg"
            >
              <span>⬇️</span>
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-omega-bg hover:bg-omega-bg/80 border border-omega-border hover:border-omega-accent/50 text-omega-text text-sm rounded transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full bg-black group">
          <video
            ref={videoRef}
            className="w-full max-h-[80vh] object-contain"
            src={fullVideoUrl}
            poster={fullThumbnailUrl}
            preload="metadata"
            autoPlay
          >
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 opacity-100 group-hover:opacity-100 transition-opacity">
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-omega-accent"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-omega-accent transition-all text-xl hover:scale-110 transform"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <span className="text-sm text-white/90 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-omega-accent transition-all hover:scale-110 transform"
                  title={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? '🔇' : '🔊'}
                </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-omega-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

