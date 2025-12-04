'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import ProjectCard from '@/components/ProjectCard'
import Logo from '@/components/Logo'
import PersistenceStatus from '@/components/PersistenceStatus'
import TemplatePickerModal from '@/components/templates/TemplatePickerModal'
import { addProject } from '@/redux/projectSlice'
import { v4 as uuidv4 } from 'uuid'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  function handleCreate() {
    const id = uuidv4()
    dispatch(
      addProject({
        id,
        name: 'Untitled Project',
        clips: [],
        script: '',
        topic: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    )
  }

  const projectCount = Object.keys(projects).length
  const totalClips = Object.values(projects).reduce(
    (sum: number, p: any) => sum + (p.clips?.length || 0),
    0
  )
  const completedProjects = Object.values(projects).filter(
    (p: any) => p.status === 'completed'
  ).length

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Logo size="md" showText={false} className="hidden md:flex" />
          <div>
            <h1 className="text-3xl font-bold text-omega-text">Your Projects</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-omega-text/60">
                {projectCount} project{projectCount !== 1 ? 's' : ''} • {totalClips} total clips
              </p>
              <PersistenceStatus
                enabled={supabaseEnabled}
                isInitialLoad={false}
                isSaving={false}
                lastSaved={null}
                showMock={!supabaseEnabled}
              />
            </div>
            <p className="text-sm text-omega-text/50 mt-2 max-w-2xl">
              Create AI-powered videos from scripts. Start by creating a new project, then generate your script, 
              edit scenes with AI, create video clips, and assemble your final video.
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-1 rounded">
                🚀 Voice Cloning
              </span>
              <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-1 rounded">
                🌍 Multilingual TTS
              </span>
              <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-1 rounded">
                🎭 Emotion Styles
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 px-6 py-3 rounded-md transition-all text-omega-text font-semibold"
          >
            📋 From Template
          </button>
          <button
            onClick={handleCreate}
            className="bg-omega-accent hover:bg-omega-accent/90 px-6 py-3 rounded-md shadow-omega-glow hover:shadow-omega-glow-lg transition-all text-white font-semibold"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Persistence Info Banner */}
      {!supabaseEnabled && (
        <div className="bg-omega-panel border border-omega-accent/30 rounded-md p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💾</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-omega-text mb-1">
                Cloud Persistence (Mock Mode)
              </h3>
              <p className="text-xs text-omega-text/60 mb-2">
                Supabase is not configured. Projects are saved locally in Redux state. 
                Configure Supabase to enable cloud persistence, auto-save, and cross-device sync.
              </p>
              <div className="flex items-center gap-2">
                <PersistenceStatus
                  enabled={false}
                  showMock={true}
                  isInitialLoad={false}
                  isSaving={false}
                  lastSaved={null}
                />
                <span className="text-xs text-omega-text/40">
                  See SUPABASE_SETUP.md for configuration
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {projectCount > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-omega-panel border border-omega-border rounded-md p-4">
            <div className="text-2xl font-bold text-omega-text">{projectCount}</div>
            <div className="text-sm text-omega-text/60 mt-1">Total Projects</div>
            <div className="text-xs text-omega-text/40 mt-1">All your video projects</div>
          </div>
          <div className="bg-omega-panel border border-omega-border rounded-md p-4">
            <div className="text-2xl font-bold text-omega-text">{completedProjects}</div>
            <div className="text-sm text-omega-text/60 mt-1">Completed</div>
            <div className="text-xs text-omega-text/40 mt-1">Fully rendered videos</div>
          </div>
          <div className="bg-omega-panel border border-omega-border rounded-md p-4">
            <div className="text-2xl font-bold text-omega-text">{totalClips}</div>
            <div className="text-sm text-omega-text/60 mt-1">Video Clips</div>
            <div className="text-xs text-omega-text/40 mt-1">Generated across all projects</div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {projectCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(projects).map((p: any) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-omega-panel border border-omega-border rounded-md">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-omega-text/60 mb-2 text-lg font-semibold">No projects yet</p>
            <p className="text-sm text-omega-text/50 mb-6">
              Get started by creating your first project. You'll be able to:
            </p>
            <div className="text-left space-y-2 mb-6 text-sm text-omega-text/60 bg-omega-bg border border-omega-border rounded-md p-4">
              <div className="flex items-start gap-2">
                <span className="text-omega-accent">1.</span>
                <span>Generate scripts with AI or write your own</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-omega-accent">2.</span>
                <span>Edit scenes using AI chat interface</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-omega-accent">3.</span>
                <span>Generate video clips for each scene</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-omega-accent">4.</span>
                <span>Assemble your final professional video</span>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="bg-omega-accent hover:bg-omega-accent/90 px-6 py-3 rounded-md shadow-omega-glow text-white font-semibold transition-all"
            >
              Create your first project
            </button>
          </div>
        </div>
      )}

      {/* Template Picker Modal */}
      <TemplatePickerModal open={templateModalOpen} setOpen={setTemplateModalOpen} />
    </div>
  )
}

