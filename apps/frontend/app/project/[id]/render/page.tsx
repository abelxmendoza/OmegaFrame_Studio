'use client'

import { useParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setStatus, setProgress } from '@/redux/generationSlice'
import { setRenderOutput } from '@/redux/projectSlice'
import { useProjectSync } from '@/hooks/useProjectSync'
import RenderProgress from '@/components/RenderProgress'
import Timeline from '@/components/Timeline'
import TimelineEditor from '@/components/TimelineEditor'
import TimelineTrack from '@/components/timeline/TimelineTrack'
import Scrubber from '@/components/timeline/Scrubber'
import VideoPreview from '@/components/VideoPreview'
import PersistenceStatus from '@/components/PersistenceStatus'
import { assembleVideo } from '@/lib/api'
import ProjectNav from '@/components/ProjectNav'
import BackButton from '@/components/BackButton'
import Logo from '@/components/Logo'
import Link from 'next/link'

export default function RenderPage() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[id]
  const generation = useAppSelector((state) => state.generation)
  const timelineClips = useAppSelector((state) => state.timeline.clips)
  const totalDuration = useAppSelector((state) => state.timeline.totalDuration)

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Use persistence hook
  const { isInitialLoad, isSaving, lastSaved } = useProjectSync({
    projectId: id,
    enabled: supabaseEnabled,
  })

  async function handleRender() {
    if (!project) return

    dispatch(setStatus('rendering'))
    dispatch(setProgress(0))

    try {
      // Get clips with trim data - prioritize path over url
      const clipsWithTrim = project.clips
        ?.map((clip: any) => {
          const clipPath = clip.path || clip.url
          if (!clipPath) return null
          
          return {
            path: clipPath,
            start: clip.start ?? 0,
            end: clip.end ?? (clip.duration ?? 5),
          }
        })
        .filter(Boolean) || []

      // Simulate progress
      const stages = [
        { progress: 10, message: 'Preparing assets...' },
        { progress: 25, message: 'Processing video clips...' },
        { progress: 50, message: 'FFmpeg: trimming and concatenating clips...' },
        { progress: 70, message: 'Adding audio track...' },
        { progress: 85, message: 'Generating thumbnail...' },
        { progress: 95, message: 'Finalizing...' },
      ]

      for (const stage of stages) {
        dispatch(setProgress(stage.progress))
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      const result = await assembleVideo(id, clipsWithTrim)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Store video URL and thumbnail in Redux
      dispatch(
        setRenderOutput({
          projectId: id,
          videoUrl: result.videoUrl,
          thumbnail: result.thumbnail,
        })
      )

      dispatch(setStatus('completed'))
      dispatch(setProgress(100))
    } catch (error) {
      console.error('Error assembling video:', error)
      dispatch(setStatus('error'))
    }
  }

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-omega-text/60">Project not found</p>
      </div>
    )
  }

  const canRender = project.script && project.clips && project.clips.length > 0

  return (
    <div className="flex flex-col h-screen">
      <ProjectNav />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Logo size="sm" showText={false} className="hidden md:flex" />
              <div className="flex-1">
                <BackButton href={`/project/${id}`} label="Project Overview" />
                <h1 className="text-3xl font-bold text-omega-text mt-2">{project.name}</h1>
                <p className="text-omega-text/60 mt-1">Final Render</p>
                <p className="text-sm text-omega-text/50 mt-2 max-w-2xl">
                  Assemble your final video by combining all clips and audio. Review the timeline below, then click "Assemble Video" to create your final export.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/project/${id}/media`}
                className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text text-sm font-medium transition-all"
              >
                ← Media
              </Link>
            </div>
          </div>

          {/* Hybrid Timeline Editor */}
          <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-omega-text mb-1">Timeline Editor</h2>
                <p className="text-sm text-omega-text/60">
                  Drag clips to reorder • Click to select • Use sliders to trim start/end points
                </p>
              </div>
            </div>
            <TimelineTrack projectId={id} />
            <Scrubber />
            {timelineClips.length > 0 && (
              <div className="text-xs text-omega-text/50 mt-2">
                Total duration: {Math.floor(totalDuration)}s • {timelineClips.length} clip{timelineClips.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Render Section */}
          <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-omega-text">Final Render</h2>
                  <PersistenceStatus
                    enabled={supabaseEnabled}
                    isInitialLoad={isInitialLoad}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    showMock={!supabaseEnabled}
                  />
                </div>
                {!canRender && (
                  <span className="text-xs text-omega-text/50">
                    {!project.script && '⚠️ Script required • '}
                    {(!project.clips || project.clips.length === 0) && '⚠️ Clips required'}
                  </span>
                )}
              </div>
              <p className="text-sm text-omega-text/60">
                Combine all your video clips with the generated audio narration to create your final video. 
                The video will be assembled using FFmpeg and saved to your project folder.
                {supabaseEnabled && ' Final exports are saved to cloud storage.'}
              </p>
            </div>

            {project.videoUrl ? (
              <VideoPreview
                videoUrl={project.videoUrl}
                thumbnail={project.thumbnail}
                projectId={id}
                projectName={project.name}
              />
            ) : (
              <>
                <button
                  onClick={handleRender}
                  disabled={!canRender || generation.status === 'rendering'}
                  className="w-full bg-omega-accent hover:bg-omega-accent/90 px-6 py-3 rounded-md shadow-omega-glow disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white font-semibold transition-all"
                >
                  {generation.status === 'rendering' ? 'Rendering...' : '🎬 Assemble Video'}
                </button>

                <RenderProgress projectId={id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

