'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { reorderClips, selectClip, setTimeline, trimClip } from '@/redux/timelineSlice'
import { saveTimelineOrder, saveClipTrim, loadTimeline } from '@/lib/supabase/timeline'
import TimelineClipUI from './TimelineClipUI'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

// Check if Supabase is enabled
const supabaseEnabled = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

interface TimelineTrackProps {
  projectId: string
}

export default function TimelineTrack({ projectId }: TimelineTrackProps) {
  const dispatch = useAppDispatch()
  const clips = useAppSelector((state) => state.timeline.clips)
  const selectedClipId = useAppSelector((state) => state.timeline.selectedClipId)
  const [isSaving, setIsSaving] = useState(false)

  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]

  // Load timeline from Supabase on mount
  useEffect(() => {
    async function load() {
      if (supabaseEnabled) {
        try {
          const timelineClips = await loadTimeline(projectId)
          dispatch(setTimeline(timelineClips))
          return
        } catch (error) {
          console.error('Error loading timeline from Supabase:', error)
        }
      }
      
      // Fallback to project clips if Supabase fails or not enabled
      if (project?.clips && project.clips.length > 0) {
        const timelineClips = project.clips.map((clip: any, index: number) => ({
          id: clip.id || `clip-${index}`,
          order_index: index,
          start: clip.start || 0,
          end: clip.end || clip.duration || 5,
          duration: clip.duration || 5,
          file_url: clip.path || clip.url || '',
          scene_id: clip.sceneId,
          thumbnail_url: clip.thumbnail,
          prompt: clip.prompt,
          provider: clip.provider,
        }))
        dispatch(setTimeline(timelineClips))
      }
    }
    load()
  }, [projectId, dispatch, project?.clips])

  async function handleReorder(result: DropResult) {
    if (!result.destination) return

    const newIndex = result.destination.index
    const clipId = clips[result.source.index].id

    // Update Redux state immediately
    dispatch(reorderClips({ id: clipId, newIndex }))

    // Save to Supabase if enabled
    if (supabaseEnabled) {
      try {
        setIsSaving(true)
        // Get updated clips from state after dispatch
        const updatedClips = [...clips]
        const [moved] = updatedClips.splice(result.source.index, 1)
        updatedClips.splice(newIndex, 0, moved)
        const clipsWithOrder = updatedClips.map((c, i) => ({
          id: c.id,
          order_index: i,
        }))
        await saveTimelineOrder(projectId, clipsWithOrder)
      } catch (error) {
        console.error('Error saving timeline order:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Legacy reorder function for TimelineClipUI (not used with drag-drop)
  function onReorder(id: string, newIndex: number) {
    handleReorder({
      source: { index: clips.findIndex((c) => c.id === id), droppableId: 'timeline' },
      destination: { index: newIndex, droppableId: 'timeline' },
    } as DropResult)
  }

  async function handleTrim(id: string, start: number, end: number) {
    dispatch(trimClip({ id, start, end }))

    // Save to Supabase if enabled
    if (supabaseEnabled) {
      try {
        await saveClipTrim(id, start, end)
      } catch (error) {
        console.error('Error saving clip trim:', error)
      }
    }
  }

  if (clips.length === 0) {
    return (
      <div className="w-full py-12 bg-omega-panel border border-omega-border rounded-md text-center">
        <div className="text-4xl mb-4">🎬</div>
        <p className="text-omega-text/60 mb-2 font-semibold">No clips in timeline</p>
        <p className="text-sm text-omega-text/50">
          Add clips from the Media page to start editing your timeline
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto py-4 bg-omega-panel rounded-md border border-omega-border scrollbar-thin scrollbar-thumb-omega-accent/20 scrollbar-track-omega-bg">
      {isSaving && (
        <div className="absolute top-2 right-2 text-xs text-omega-text/60 bg-omega-accent/20 px-2 py-1 rounded">
          Saving...
        </div>
      )}
      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="timeline" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-3 px-4 min-h-[200px]"
            >
              {clips.map((clip, index) => (
                <Draggable key={clip.id} draggableId={clip.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'opacity-50' : ''}
                    >
                      <TimelineClipUI
                        clip={clip}
                        index={index}
                        onReorder={onReorder}
                        onTrim={handleTrim}
                        isSelected={selectedClipId === clip.id}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
