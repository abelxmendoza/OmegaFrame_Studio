'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { reorderClips, setClipTrim } from '@/redux/projectSlice'
import { Clip } from '@/redux/projectSlice'
import TrimModal from './TrimModal'

interface TimelineEditorProps {
  projectId: string
}

export default function TimelineEditor({ projectId }: TimelineEditorProps) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const [trimmingClip, setTrimmingClip] = useState<Clip | null>(null)

  if (!project) return null

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(project.clips)
    const [moved] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, moved)

    dispatch(reorderClips({ projectId, newOrder: items }))
  }

  const handleTrimSave = (clipId: string, start: number, end: number) => {
    dispatch(setClipTrim({ projectId, clipId, start, end }))
    setTrimmingClip(null)
  }

  const handleClipClick = (clip: Clip) => {
    setTrimmingClip(clip)
  }

  if (!project.clips || project.clips.length === 0) {
    return (
      <div className="bg-omega-panel border border-omega-border rounded-md p-6">
        <h2 className="text-xl font-semibold text-omega-text mb-2">Timeline Editor</h2>
        <p className="text-sm text-omega-text/60">No clips to edit. Add clips in the Media tab.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-omega-panel border border-omega-border rounded-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-omega-text mb-2">Timeline Editor</h2>
          <p className="text-sm text-omega-text/60">
            Drag clips to reorder • Click to trim start/end points
          </p>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="timeline" direction="horizontal">
            {(provided) => (
              <div
                className="flex space-x-2 overflow-x-auto p-2 bg-omega-bg rounded-lg border border-omega-border min-h-[120px]"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {project.clips.map((clip, index) => (
                  <Draggable key={clip.id} draggableId={clip.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        className={`flex-shrink-0 w-40 h-24 bg-omega-panel rounded-md shadow-lg cursor-pointer relative border-2 transition-all ${
                          snapshot.isDragging
                            ? 'border-omega-accent shadow-omega-glow'
                            : 'border-omega-border hover:border-omega-accent/50'
                        }`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleClipClick(clip)}
                      >
                        {(clip.path || clip.url) ? (
                          <video
                            src={clip.path || clip.url}
                            className="w-full h-full object-cover opacity-80 rounded-md"
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <div className="w-full h-full bg-omega-bg flex items-center justify-center rounded-md">
                            <span className="text-omega-text/30 text-xs">Clip {index + 1}</span>
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="text-xs bg-black/70 text-white px-1.5 py-0.5 rounded text-center">
                            {clip.start.toFixed(1)}s → {clip.end.toFixed(1)}s
                          </div>
                        </div>
                        {clip.sceneNumber && (
                          <div className="absolute top-1 left-1 bg-omega-accent/90 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                            S{clip.sceneNumber}
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="mt-4 text-xs text-omega-text/50">
          {project.clips.length} clip{project.clips.length !== 1 ? 's' : ''} • Total duration:{' '}
          {project.clips.reduce((sum, clip) => sum + (clip.end - clip.start), 0).toFixed(1)}s
        </div>
      </div>

      {trimmingClip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-omega-panel border border-omega-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-omega-text">Trim Clip</h3>
                <button
                  onClick={() => setTrimmingClip(null)}
                  className="text-omega-text/60 hover:text-omega-text"
                >
                  ×
                </button>
              </div>
              <TrimModal
                clip={trimmingClip}
                onSave={(start, end) => handleTrimSave(trimmingClip.id, start, end)}
                onCancel={() => setTrimmingClip(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
