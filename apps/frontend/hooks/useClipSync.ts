'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { addClip, updateClip } from '@/redux/projectSlice'
import { saveClip, updateClip as updateClipDB } from '@/lib/supabase/clips'
import { uploadFile } from '@/lib/supabase/upload'
import type { Clip as DBClip } from '@/types/db'

interface UseClipSyncOptions {
  projectId: string
  enabled?: boolean
}

export function useClipSync({ projectId, enabled = true }: UseClipSyncOptions) {
  const dispatch = useAppDispatch()
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  const saveClipToDB = async (clip: any) => {
    if (!enabled) return

    try {
      const clipData = {
        project_id: projectId,
        scene_id: clip.sceneId || null,
        provider: clip.provider || 'pika',
        status: 'done',
        file_url: clip.path || clip.url || null,
        thumbnail_url: clip.thumbnail || null,
        duration: clip.duration || null,
        prompt: clip.prompt || null,
        order_index: 0, // Will be updated when reordering
      }

      await saveClip(clipData)
    } catch (error) {
      console.error('Error saving clip to DB:', error)
    }
  }

  const updateClipInDB = async (clipId: string, updates: any) => {
    if (!enabled) return

    try {
      await updateClipDB(clipId, {
        file_url: updates.path || updates.url || undefined,
        thumbnail_url: updates.thumbnail || undefined,
        duration: updates.duration || undefined,
        prompt: updates.prompt || undefined,
      })
    } catch (error) {
      console.error('Error updating clip in DB:', error)
    }
  }

  return {
    saveClipToDB,
    updateClipInDB,
  }
}
