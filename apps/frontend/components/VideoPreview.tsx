'use client'

import { useState, useRef, useEffect } from 'react'

interface VideoPreviewProps {
  videoUrl: string
  thumbnail?: string
  projectId: string
  projectName?: string
}

export default function VideoPreview({ videoUrl, thumbnail, projectId, projectName }: VideoPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Construct full URL - supports Supabase Storage URLs, local paths, and full URLs
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
    // Supabase Storage URL
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

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(fullVideoUrl)
      if (!response.ok) throw new Error('Failed to fetch video')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${projectName || projectId}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading video:', error)
      alert('Failed to download video. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

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

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-omega-text">Final Video</h3>
        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
          ✓ Ready
        </span>
      </div>

      {/* Enhanced Video Player */}
      <div className="relative w-full bg-omega-bg rounded-lg overflow-hidden border border-omega-border group shadow-lg">
        <video
          ref={videoRef}
          className="w-full aspect-video object-contain"
          src={fullVideoUrl}
          poster={fullThumbnailUrl}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="flex-1 h-1 bg-omega-text/20 rounded-lg appearance-none cursor-pointer accent-omega-accent"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-omega-accent transition-colors text-lg hover:scale-110 transform"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <span className="text-xs text-white/90 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-omega-accent transition-colors hover:scale-110 transform"
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
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-omega-accent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full bg-omega-accent hover:bg-omega-accent/90 px-6 py-3 rounded-md shadow-omega-glow hover:shadow-omega-glow-lg disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isDownloading ? (
          <>
            <span className="animate-spin text-xl">⏳</span>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <span className="text-xl">⬇️</span>
            <span>Download Video</span>
          </>
        )}
      </button>

      {/* Direct Link */}
      <div className="text-center">
        <a
          href={fullVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-omega-accent hover:text-omega-accent/80 transition-colors"
        >
          Open in new tab →
        </a>
      </div>
    </div>
  )
}

