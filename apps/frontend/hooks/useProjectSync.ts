'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loadProject, updateProject } from '@/lib/supabase/projects'
import { syncScenes } from '@/lib/supabase/scenes'
import { reorderClips } from '@/lib/supabase/clips'
import { addProject, setScript, setScenes, updateProjectName } from '@/redux/projectSlice'
import type { Project as DBProject } from '@/types/db'

interface UseProjectSyncOptions {
  projectId: string
  autoSaveDelay?: number // milliseconds
  enabled?: boolean
}

export function useProjectSync({ projectId, autoSaveDelay = 1500, enabled = true }: UseProjectSyncOptions) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoad = useRef(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load project on mount
  useEffect(() => {
    if (!enabled || !projectId) return

    async function init() {
      try {
        const data = await loadProject(projectId)
        
        // Transform DB project to Redux format
        const reduxProject = {
          id: data.id,
          name: data.title || 'Untitled Project',
          script: data.script || '',
          clips: (data.clips || []).map((clip: any) => ({
            id: clip.id,
            path: clip.file_url || '',
            url: clip.file_url || undefined,
            prompt: clip.prompt || '',
            provider: clip.provider || 'pika',
            sceneId: clip.scene_id || undefined,
            start: clip.start_trim || 0,
            end: clip.end_trim || clip.duration || 5,
            duration: clip.duration || 5,
            thumbnail: clip.thumbnail_url || undefined,
          })),
          scenes: (data.scenes || []).map((scene: any) => ({
            id: scene.id,
            number: scene.number,
            title: scene.title || '',
            description: scene.description || '',
            prompt: scene.prompt,
          })),
          status: data.status || 'draft',
          seoTitle: data.seo_title || undefined,
          seoDescription: data.seo_description || undefined,
          seoTags: data.seo_tags || undefined,
          seoHashtags: data.seo_hashtags || undefined,
          seoChapters: data.seo_chapters || undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }

        dispatch(addProject(reduxProject as any))
        isInitialLoad.current = false
      } catch (error) {
        console.error('Error loading project:', error)
        // If project doesn't exist in DB, continue with Redux state
        isInitialLoad.current = false
      }
    }

    init()
  }, [projectId, enabled, dispatch])

  // Auto-save project data
  useEffect(() => {
    if (!enabled || !project || isInitialLoad.current) return

    // Clear existing timer
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }

    // Set new timer
    saveTimer.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await updateProject(projectId, {
          title: project.name,
          script: project.script,
          status: project.status || 'draft',
          seo_title: project.seoTitle || null,
          seo_description: project.seoDescription || null,
          seo_tags: project.seoTags || null,
          seo_hashtags: project.seoHashtags || null,
          seo_chapters: project.seoChapters || null,
        })

        // Sync scenes if they exist
        if (project.scenes && project.scenes.length > 0) {
          await syncScenes(
            projectId,
            project.scenes.map((scene) => ({
              project_id: projectId,
              number: scene.number,
              title: scene.title,
              description: scene.description,
              prompt: scene.prompt,
            }))
          )
        }

        setLastSaved(new Date())
        console.log('Auto-saved project', projectId)
      } catch (error) {
        console.error('Error auto-saving project:', error)
      } finally {
        setIsSaving(false)
      }
    }, autoSaveDelay)

    // Cleanup
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [
    project?.name,
    project?.script,
    project?.status,
    project?.seoTitle,
    project?.seoDescription,
    project?.seoTags,
    project?.seoHashtags,
    project?.seoChapters,
    projectId,
    enabled,
    autoSaveDelay,
  ])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (!project) return false

    setIsSaving(true)
    try {
      await updateProject(projectId, {
        title: project.name,
        script: project.script,
        status: project.status || 'draft',
        seo_title: project.seoTitle || null,
        seo_description: project.seoDescription || null,
        seo_tags: project.seoTags || null,
        seo_hashtags: project.seoHashtags || null,
        seo_chapters: project.seoChapters || null,
      })

      if (project.scenes && project.scenes.length > 0) {
        await syncScenes(
          projectId,
          project.scenes.map((scene) => ({
            project_id: projectId,
            number: scene.number,
            title: scene.title,
            description: scene.description,
            prompt: scene.prompt,
          }))
        )
      }

      setLastSaved(new Date())
      return true
    } catch (error) {
      console.error('Error saving project:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [project, projectId])

  return {
    saveNow,
    isInitialLoad: isInitialLoad.current,
    isSaving,
    lastSaved,
  }
}
