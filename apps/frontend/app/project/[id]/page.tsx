'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { updateProjectName } from '@/redux/projectSlice'
import { useProjectSync } from '@/hooks/useProjectSync'
import Logo from '@/components/Logo'
import BackButton from '@/components/BackButton'
import PersistenceStatus from '@/components/PersistenceStatus'
import { ProjectThumbnail } from '@/components/thumbnails/ProjectThumbnail'

export default function ProjectOverview() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[id]
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(project?.name || '')

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Use persistence hook
  const { saveNow, isInitialLoad, isSaving, lastSaved } = useProjectSync({
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

  const navCards = [
    {
      href: `/project/${id}/editor`,
      title: 'Script',
      icon: '📝',
      description: 'Write or generate your video script',
      helpText: 'Create your script here. Use AI to generate or write manually. Scenes will be automatically extracted.',
      status: project.script ? '✓ Complete' : 'Not started',
      color: project.script ? 'border-green-500/30' : 'border-omega-border',
    },
    {
      href: `/project/${id}/media`,
      title: 'Media',
      icon: '🎬',
      description: 'Generate video clips with AI',
      helpText: 'Edit scenes with AI chat, then generate video clips for each scene. You can edit individual clips too.',
      status: project.clips?.length
        ? `✓ ${project.clips.length} clip${project.clips.length !== 1 ? 's' : ''}`
        : 'Not started',
      color: project.clips?.length ? 'border-green-500/30' : 'border-omega-border',
    },
    {
      href: `/project/${id}/render`,
      title: 'Render',
      icon: '🎞️',
      description: 'Assemble and export final video',
      helpText: 'Combine all your clips and audio into a final video. Requires a script and at least one clip.',
      status: 'Ready when script & clips are complete',
      color: 'border-omega-border',
    },
  ]

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/dashboard" label="Dashboard" />
          <div className="flex items-center gap-4">
            <PersistenceStatus
              enabled={supabaseEnabled}
              isInitialLoad={isInitialLoad}
              isSaving={isSaving}
              lastSaved={lastSaved}
              showMock={!supabaseEnabled}
            />
            <Logo size="sm" showText={false} className="md:hidden" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Logo size="md" showText={false} className="hidden md:flex" />
          {/* Project Thumbnail */}
          {(project.thumbnail || project.thumbnail_url) && (
            <div className="hidden md:block w-32 h-20 rounded-lg overflow-hidden border border-omega-border">
              <ProjectThumbnail
                src={project.thumbnail_url || project.thumbnail}
                alt={project.name}
                className="w-full h-full"
              />
            </div>
          )}
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editedName.trim()) {
                        dispatch(updateProjectName({ projectId: id, name: editedName.trim() }))
                      }
                      setIsEditingName(false)
                    }
                    if (e.key === 'Escape') {
                      setEditedName(project.name)
                      setIsEditingName(false)
                    }
                  }}
                  className="text-4xl font-bold bg-omega-bg border border-omega-accent/50 rounded px-3 py-2 text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (editedName.trim()) {
                      dispatch(updateProjectName({ projectId: id, name: editedName.trim() }))
                    }
                    setIsEditingName(false)
                  }}
                  className="text-green-400 hover:text-green-300 text-xl"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditedName(project.name)
                    setIsEditingName(false)
                  }}
                  className="text-red-400 hover:text-red-300 text-xl"
                  title="Cancel"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-4xl font-bold text-omega-text">{project.name}</h1>
                <button
                  onClick={() => {
                    setEditedName(project.name)
                    setIsEditingName(true)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-omega-text/60 hover:text-omega-accent"
                  title="Edit project name"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-omega-text/60 mt-2">
              {project.topic || 'No topic set'}
            </p>
          </div>
        </div>

        {/* Workflow Guide */}
        {(!project.script || !project.clips || project.clips.length === 0) && (
          <div className="bg-omega-panel border border-omega-accent/30 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-omega-text mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Getting Started</span>
            </h3>
            <div className="space-y-3 text-sm text-omega-text/70">
              <div className="flex items-start gap-3">
                <span className="text-omega-accent font-bold mt-0.5">1.</span>
                <div>
                  <p className="font-medium text-omega-text">Script</p>
                  <p className="text-xs text-omega-text/60 mt-1">
                    Write or generate your video script. Use <code className="text-omega-accent">[SCENE X: Title]</code> format to define scenes. 
                    Scenes will automatically extract for editing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-omega-accent font-bold mt-0.5">2.</span>
                <div>
                  <p className="font-medium text-omega-text">Media</p>
                  <p className="text-xs text-omega-text/60 mt-1">
                    Edit scenes with AI chat, then generate video clips. You can edit or regenerate individual clips if needed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-omega-accent font-bold mt-0.5">3.</span>
                <div>
                  <p className="font-medium text-omega-text">Render</p>
                  <p className="text-xs text-omega-text/60 mt-1">
                    Assemble your final video by combining all clips with audio narration. Your completed video will be saved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`bg-omega-panel border-2 ${card.color} rounded-lg p-6 hover:border-omega-accent/50 transition-all group`}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold text-omega-text mb-2">{card.title}</h3>
              <p className="text-sm text-omega-text/60 mb-3">{card.description}</p>
              <p className="text-xs text-omega-text/40 mb-4 italic">{card.helpText}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-omega-text/50">{card.status}</span>
                <span className="text-omega-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Project Stats */}
        <div className="bg-omega-panel border border-omega-border rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-omega-text mb-4">Project Status</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-omega-text">
                {project.script ? project.script.split('\n').length : 0}
              </div>
              <div className="text-sm text-omega-text/60">Script Lines</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-omega-text">
                {project.clips?.length || 0}
              </div>
              <div className="text-sm text-omega-text/60">Video Clips</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-omega-text">
                {project.status || 'draft'}
              </div>
              <div className="text-sm text-omega-text/60">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

