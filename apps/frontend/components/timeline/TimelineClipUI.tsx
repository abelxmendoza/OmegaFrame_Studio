'use client'

import { useState, useRef } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { selectClip } from '@/redux/timelineSlice'
import type { TimelineClip } from '@/redux/timelineSlice'

interface TimelineClipUIProps {
  clip: TimelineClip
  index: number
  onReorder: (id: string, newIndex: number) => void
  onTrim: (id: string, start: number, end: number) => void
  isSelected: boolean
}

export default function TimelineClipUI({
  clip,
  index,
  onReorder,
  onTrim,
  isSelected,
}: TimelineClipUIProps) {
  const dispatch = useAppDispatch()
  const [dragging, setDragging] = useState(false)
  const [localStart, setLocalStart] = useState(clip.start)
  const [localEnd, setLocalEnd] = useState(clip.end)
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const dragStartPos = useRef<number>(0)

  function handleDragStart(e: React.DragEvent) {
    setDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setDragging(false)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    // Reorder logic handled by parent
  }

  function handleClick() {
    dispatch(selectClip(clip.id))
  }

  function onLeftTrim(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = Math.max(0, Math.min(localEnd - 0.1, Number(e.target.value)))
    setLocalStart(newStart)
    onTrim(clip.id, newStart, localEnd)
  }

  function onRightTrim(e: React.ChangeEvent<HTMLInputElement>) {
    const newEnd = Math.max(localStart + 0.1, Math.min(clip.duration, Number(e.target.value)))
    setLocalEnd(newEnd)
    onTrim(clip.id, localStart, newEnd)
  }

  const trimmedDuration = localEnd - localStart

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative bg-omega-panel border-2 rounded-md p-2 min-w-[180px] cursor-grab flex flex-col transition-all ${
        isSelected
          ? 'border-omega-accent shadow-omega-glow'
          : 'border-omega-border hover:border-omega-accent/50'
      } ${dragging ? 'opacity-50 scale-95' : ''}`}
    >
      {/* Thumbnail */}
      {clip.file_url ? (
        <video
          src={clip.file_url}
          className="w-full h-24 object-cover rounded-md"
          muted
          playsInline
        />
      ) : (
        <div className="w-full h-24 bg-omega-bg border border-omega-border rounded-md flex items-center justify-center">
          <span className="text-omega-text/30 text-xs">No preview</span>
        </div>
      )}

      {/* Clip info */}
      <div className="flex items-center justify-between mt-1">
        <div className="text-xs text-omega-text/70">
          {clip.scene_id ? `Scene ${clip.scene_id}` : `Clip ${index + 1}`}
        </div>
        <div className="text-xs text-omega-text/50">{trimmedDuration.toFixed(1)}s</div>
      </div>

      {/* Trim controls */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1">
          <label className="text-[10px] text-omega-text/50 block mb-0.5">Start</label>
          <input
            type="range"
            min={0}
            max={clip.duration}
            step={0.1}
            value={localStart}
            onChange={onLeftTrim}
            onMouseDown={() => setIsDraggingLeft(true)}
            onMouseUp={() => setIsDraggingLeft(false)}
            className="w-full accent-omega-accent h-1"
          />
          <div className="text-[10px] text-omega-text/40 text-center mt-0.5">
            {localStart.toFixed(1)}s
          </div>
        </div>

        <div className="flex-1">
          <label className="text-[10px] text-omega-text/50 block mb-0.5">End</label>
          <input
            type="range"
            min={0}
            max={clip.duration}
            step={0.1}
            value={localEnd}
            onChange={onRightTrim}
            onMouseDown={() => setIsDraggingRight(true)}
            onMouseUp={() => setIsDraggingRight(false)}
            className="w-full accent-omega-accent h-1"
          />
          <div className="text-[10px] text-omega-text/40 text-center mt-0.5">
            {localEnd.toFixed(1)}s
          </div>
        </div>
      </div>
    </div>
  )
}
