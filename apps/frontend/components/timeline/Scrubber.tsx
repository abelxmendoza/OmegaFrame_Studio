'use client'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setScrubTime } from '@/redux/timelineSlice'

export default function Scrubber() {
  const dispatch = useAppDispatch()
  const scrubTime = useAppSelector((state) => state.timeline.scrubTime)
  const totalDuration = useAppSelector((state) => state.timeline.totalDuration)

  const maxDuration = Math.max(totalDuration, 180) // At least 3 minutes

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-16 bg-omega-panel border border-omega-border rounded-md mt-4">
      {/* Time labels */}
      <div className="absolute top-1 left-2 text-xs text-omega-text/60 font-mono">
        {formatTime(scrubTime)}
      </div>
      <div className="absolute top-1 right-2 text-xs text-omega-text/60 font-mono">
        {formatTime(maxDuration)}
      </div>

      {/* Scrubber bar */}
      <div className="absolute inset-0 flex items-center px-4">
        <div className="relative w-full h-2 bg-omega-bg rounded-full">
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-omega-accent/50 rounded-full transition-all"
            style={{ width: `${(scrubTime / maxDuration) * 100}%` }}
          />

          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-omega-accent rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform -translate-x-1/2 z-10"
            style={{ left: `${(scrubTime / maxDuration) * 100}%` }}
          />
        </div>
      </div>

      {/* Input range (invisible, for interaction) */}
      <input
        type="range"
        min={0}
        max={maxDuration}
        step={0.1}
        value={scrubTime}
        onChange={(e) => dispatch(setScrubTime(Number(e.target.value)))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />

      {/* Time markers */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-between px-4">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div
            key={ratio}
            className="w-px h-2 bg-omega-text/20"
            style={{ left: `${ratio * 100}%` }}
          />
        ))}
      </div>
    </div>
  )
}
