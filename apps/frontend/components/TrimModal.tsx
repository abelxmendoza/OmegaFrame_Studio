'use client'

import { useState, useEffect, useRef } from 'react'
import { Clip } from '@/redux/projectSlice'

interface TrimModalProps {
  clip: Clip
  onSave: (start: number, end: number) => void
  onCancel: () => void
}

export default function TrimModal({ clip, onSave, onCancel }: TrimModalProps) {
  const [start, setStart] = useState(clip.start)
  const [end, setEnd] = useState(clip.end)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoDuration, setVideoDuration] = useState(clip.duration)

  useEffect(() => {
    setStart(clip.start)
    setEnd(clip.end)
  }, [clip])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoadedMetadata = () => {
        const duration = video.duration || clip.duration
        setVideoDuration(duration)
        // Ensure end doesn't exceed duration
        if (end > duration) {
          setEnd(duration)
        }
      }
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [clip, end])

  const handleStartChange = (value: number) => {
    const newStart = Math.max(0, Math.min(value, end - 0.1))
    setStart(newStart)
    if (videoRef.current) {
      videoRef.current.currentTime = newStart
    }
  }

  const handleEndChange = (value: number) => {
    const newEnd = Math.max(start + 0.1, Math.min(value, videoDuration))
    setEnd(newEnd)
  }

  const handleSave = () => {
    if (start >= 0 && end > start && end <= videoDuration) {
      onSave(start, end)
    }
  }

  const videoSrc = clip.path || clip.url

  return (
    <div className="space-y-4">
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          className="w-full rounded-lg bg-omega-bg"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              const duration = videoRef.current.duration || clip.duration
              setVideoDuration(duration)
            }
          }}
        />
      ) : (
        <div className="w-full aspect-video bg-omega-bg border border-omega-border rounded-lg flex items-center justify-center">
          <span className="text-omega-text/30">No video preview available</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-omega-text/80 mb-2 block">
            Start (seconds)
          </label>
          <input
            type="number"
            value={start.toFixed(2)}
            min={0}
            max={end - 0.1}
            step={0.1}
            onChange={(e) => handleStartChange(Number(e.target.value))}
            className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
          />
          <input
            type="range"
            min={0}
            max={Math.max(0, end - 0.1)}
            step={0.1}
            value={start}
            onChange={(e) => handleStartChange(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-omega-text/80 mb-2 block">
            End (seconds)
          </label>
          <input
            type="number"
            value={end.toFixed(2)}
            min={start + 0.1}
            max={videoDuration}
            step={0.1}
            onChange={(e) => handleEndChange(Number(e.target.value))}
            className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
          />
          <input
            type="range"
            min={Math.max(0.1, start + 0.1)}
            max={videoDuration}
            step={0.1}
            value={end}
            onChange={(e) => handleEndChange(Number(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>

      <div className="bg-omega-bg border border-omega-border rounded-md p-3">
        <div className="text-sm text-omega-text/70">
          <div>Duration: {(end - start).toFixed(2)}s</div>
          <div className="text-xs text-omega-text/50 mt-1">
            Original: {videoDuration.toFixed(2)}s • Trimmed: {((end - start) / videoDuration * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md text-white font-semibold transition-all"
        >
          Save Trim
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
