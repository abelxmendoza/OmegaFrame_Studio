'use client'

import { useParams } from 'next/navigation'
import { useAppSelector } from '@/redux/hooks'
import { useProjectSync } from '@/hooks/useProjectSync'
import PromptInput from '@/components/PromptInput'
import ClipCard from '@/components/ClipCard'
import SceneEditor from '@/components/SceneEditor'
import ProjectNav from '@/components/ProjectNav'
import BackButton from '@/components/BackButton'
import Logo from '@/components/Logo'
import PersistenceStatus from '@/components/PersistenceStatus'
import Link from 'next/link'

export default function MediaPage() {
  const params = useParams()
  const id = params.id as string
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[id]

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Use persistence hook
  const { isInitialLoad, isSaving, lastSaved } = useProjectSync({
    projectId: id,
    enabled: supabaseEnabled,
  })

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-omega-text/60">Project not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <ProjectNav />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Logo size="sm" showText={false} className="hidden md:flex" />
              <div className="flex-1">
                <BackButton href={`/project/${id}`} label="Project Overview" />
                <div className="flex items-center gap-3 mt-2">
                  <h1 className="text-3xl font-bold text-omega-text">{project.name}</h1>
                  <PersistenceStatus
                    enabled={supabaseEnabled}
                    isInitialLoad={isInitialLoad}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    showMock={!supabaseEnabled}
                  />
                </div>
                <p className="text-omega-text/60 mt-1">Media Generator</p>
                <p className="text-sm text-omega-text/50 mt-2 max-w-2xl">
                  Edit your scenes with AI chat, then generate video clips. All generated clips appear at the top. 
                  You can edit or regenerate individual clips if needed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/project/${id}/editor`}
                className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text text-sm font-medium transition-all"
              >
                ← Script
              </Link>
              <Link
                href={`/project/${id}/render`}
                className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text text-sm font-medium transition-all"
              >
                Next: Render →
              </Link>
            </div>
          </div>

          {/* Clips Grid - Moved to Top */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-omega-text">
                  Generated Clips ({project.clips?.length || 0})
                </h2>
                <p className="text-xs text-omega-text/50 mt-1">
                  All your video clips appear here. Click a clip to preview in full screen, or hover to edit, download, or delete.
                </p>
              </div>
            </div>

            {project.clips && project.clips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.clips.map((clip: any, i: number) => (
                  <ClipCard key={clip.id || i} projectId={id} clipIndex={i} clip={clip} />
                ))}
              </div>
            ) : (
              <div className="bg-omega-panel border border-omega-border rounded-md p-12 text-center">
                <div className="text-4xl mb-4">🎥</div>
                <p className="text-omega-text/60 mb-2 font-semibold">No clips generated yet</p>
                <p className="text-sm text-omega-text/50 mb-4">
                  Your generated video clips will appear here
                </p>
                <div className="text-xs text-omega-text/40 space-y-1 max-w-md mx-auto">
                  <p>• Edit scenes below using AI chat</p>
                  <p>• Click "Generate All" to create clips for all scenes</p>
                  <p>• Or generate individual clips with custom prompts</p>
                </div>
              </div>
            )}
          </div>

          {/* Scene Editor */}
          <SceneEditor projectId={id} />

          {/* Prompt Input */}
          <PromptInput projectId={id} />
        </div>
      </div>
    </div>
  )
}

