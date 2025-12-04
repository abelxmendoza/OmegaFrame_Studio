'use client'

import { useParams } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { useState, useEffect } from 'react'
import { setScript, setScenes, updateProjectThumbnail } from '@/redux/projectSlice'
import { generateScript, generateVoice, generateThumbnail } from '@/lib/api'
import { getTemplateById } from '@/lib/templates'
import { parseScenesFromScript } from '@/lib/sceneParser'
import { getTemplateGenerationPrompt } from '@/lib/templateUtils'
import { store } from '@/redux/store'
import { useProjectSync } from '@/hooks/useProjectSync'
import ProjectNav from '@/components/ProjectNav'
import BackButton from '@/components/BackButton'
import Logo from '@/components/Logo'
import VoicePicker from '@/components/VoicePicker'
import VoiceOptionsPanel from '@/components/VoiceOptionsPanel'
import PersistenceStatus from '@/components/PersistenceStatus'
import Link from 'next/link'

export default function ScriptEditorPage() {
  const params = useParams()
  const id = params.id as string
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const settings = useAppSelector((state) => state.settings)
  const project = projects[id]
  const [loading, setLoading] = useState(false)
  const [generatingVoice, setGeneratingVoice] = useState(false)
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false)

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Use persistence hook
  const { isInitialLoad, isSaving, lastSaved } = useProjectSync({
    projectId: id,
    enabled: supabaseEnabled,
  })

  // Auto-generate scenes when script changes
  useEffect(() => {
    if (project?.script && project.script.length > 50) {
      const scenes = parseScenesFromScript(project.script)
      if (scenes.length > 0) {
        // Only update if scenes have changed
        const currentScenes = project.scenes || []
        if (
          scenes.length !== currentScenes.length ||
          scenes.some((s, i) => s.title !== currentScenes[i]?.title)
        ) {
          dispatch(setScenes({ projectId: id, scenes }))
        }
      }
    }
  }, [project?.script, id, dispatch, project?.scenes])

  async function handleGPT() {
    setLoading(true)
    try {
      const topic = project?.topic || 'Make a YouTube video script with multiple scenes'
      // Use template-specific prompt if template is selected
      const prompt = getTemplateGenerationPrompt(project?.templateId, topic)
      const result = await generateScript(prompt)
      dispatch(setScript({ projectId: id, script: result.script }))
      
      // Auto-parse scenes from generated script
      const scenes = parseScenesFromScript(result.script)
      if (scenes.length > 0) {
        dispatch(setScenes({ projectId: id, scenes }))
      }
    } catch (error) {
      console.error('Error generating script:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateVoice() {
    if (!project?.script) {
      alert('Please generate or write a script first')
      return
    }

    // Check if custom voice is selected (untrained recording)
    const state = store.getState()
    if (project.voiceId === 'custom-voice' && !state.settings.customVoiceAudio) {
      alert('Please record your voice in Settings first')
      return
    }

    // Check if local voice is selected (Phase 2 - not yet available)
    const clonedVoice = state.settings.clonedVoices.find((v) => v.voice_id === project.voiceId)
    if (clonedVoice && clonedVoice.provider === 'xtts') {
      alert('Local voice generation requires GPU. This will be available in Phase 2.')
      return
    }

    setGeneratingVoice(true)
    try {
      // Determine engine based on voice type
      const clonedVoice = state.settings.clonedVoices.find((v) => v.voice_id === project.voiceId)
      const engine = clonedVoice?.provider === 'xtts' ? 'local' : 'cloud'

      await generateVoice({
        projectId: id,
        script: project.script,
        voiceId: project.voiceId,
        engine,
        language: state.settings.voiceLanguage || 'en',
        style: state.settings.voiceStyle || 'neutral',
      })
      alert('Voice generated successfully!')
    } catch (error) {
      console.error('Error generating voice:', error)
      alert('Failed to generate voice')
    } finally {
      setGeneratingVoice(false)
    }
  }

  async function handleRegenerateThumbnail() {
    if (!project?.script || project.script.length < 50) {
      alert('Please write or generate a script first (at least 50 characters)')
      return
    }

    setGeneratingThumbnail(true)
    try {
      const template = project.templateId ? getTemplateById(project.templateId) : null
      const result = await generateThumbnail(id, project.script, project.templateId)
      
      // Update project thumbnail in Redux
      dispatch(updateProjectThumbnail({ projectId: id, thumbnail: result.url }))
      
      alert('Thumbnail generated successfully!')
    } catch (error: any) {
      console.error('Error generating thumbnail:', error)
      alert(error.userMessage || 'Failed to generate thumbnail')
    } finally {
      setGeneratingThumbnail(false)
    }
  }

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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Logo size="sm" showText={false} className="hidden md:flex" />
              <div className="flex-1">
                <BackButton href={`/project/${id}`} label="Project Overview" />
                <h1 className="text-3xl font-bold text-omega-text mt-2">{project.name}</h1>
                <p className="text-omega-text/60 mt-1">Script Editor</p>
                <p className="text-sm text-omega-text/50 mt-2 max-w-2xl">
                  Write or generate your video script here. Use <code className="text-omega-accent">[SCENE X: Title]</code> format to define scenes. 
                  Scenes will automatically extract and appear below. Then select a voice and generate narration.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/project/${id}/media`}
                className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text text-sm font-medium transition-all"
              >
                Next: Media →
              </Link>
            </div>
          </div>

          {/* Voice Picker */}
          <div className="bg-omega-panel border border-omega-border rounded-md p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-omega-text">Voice Selection</h3>
                <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-0.5 rounded">
                  Required for narration
                </span>
              </div>
              <VoicePicker projectId={id} />
              <p className="text-xs text-omega-text/50 mt-2">
                Choose from 11 AI voices, your cloned voices, or your own recorded voice. The selected voice will narrate your entire script.
              </p>
            </div>

            {/* Voice Options Panel */}
            <div>
              <VoiceOptionsPanel />
              <p className="text-xs text-omega-text/50 mt-2 text-center">
                💡 <strong>New:</strong> Generate voices in multiple languages with different emotional styles!
              </p>
            </div>
            {project.script && (
              <div className="space-y-2">
                <button
                  onClick={handleGenerateVoice}
                  disabled={generatingVoice}
                  className="w-full bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md shadow-omega-glow disabled:opacity-50 text-white text-sm font-semibold transition-all"
                >
                  {generatingVoice ? 'Generating Voice...' : '🎤 Generate Voice from Script'}
                </button>
                <p className="text-xs text-omega-text/50 text-center">
                  Creates audio narration using your selected voice. This will be used in the final video.
                </p>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="bg-omega-panel border border-omega-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-omega-border">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-omega-text">Script</h2>
                  <PersistenceStatus
                    enabled={supabaseEnabled}
                    isInitialLoad={isInitialLoad}
                    isSaving={isSaving}
                    lastSaved={lastSaved}
                    showMock={!supabaseEnabled}
                  />
                </div>
                <p className="text-xs text-omega-text/50">
                  Write your script or use AI to generate one. Use <code className="text-omega-accent">[SCENE X: Title]</code> followed by description to create scenes.
                  {project?.templateId && (
                    <span className="text-omega-accent ml-1">Template structure will guide generation.</span>
                  )}
                  {supabaseEnabled && ' Changes auto-save to cloud.'}
                </p>
              </div>
              <button
                onClick={handleGPT}
                disabled={loading}
                className="bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md shadow-omega-glow disabled:opacity-50 text-white text-sm font-semibold transition-all"
                title="Generate a complete script using AI based on your project topic"
              >
                {loading ? 'Generating...' : '✨ Generate with GPT'}
              </button>
            </div>

            <textarea
              className="w-full bg-omega-bg border-0 h-[calc(100vh-500px)] min-h-[500px] p-6 text-omega-text focus:outline-none resize-none font-mono text-sm leading-relaxed"
              value={project.script || ''}
              onChange={(e) =>
                dispatch(setScript({ projectId: id, script: e.target.value }))
              }
              placeholder="INT. DARK CITY – NIGHT&#10;Neon lights flicker against rain-soaked streets. The city never sleeps.&#10;&#10;[SCENE 1: Wide shot of cityscape]&#10;The camera pans across a sprawling metropolis, where holographic advertisements dance in the air.&#10;&#10;[SCENE 2: Street level]&#10;We follow a figure walking through narrow alleys, reflections of neon signs shimmering in puddles.&#10;&#10;[SCENE 3: Close-up]&#10;Raindrops hit the lens. The city's pulse is electric, alive, dangerous.&#10;&#10;FADE OUT.&#10;&#10;---&#10;&#10;Write or generate your script here. Scenes will be automatically extracted when you use the [SCENE X: Title] format. Focus on crafting the perfect narrative for your voice-over."
            />
          </div>

          {project.script && (
            <div className="text-sm text-omega-text/50">
              {project.script.split('\n').length} lines • {project.script.length} characters
            </div>
          )}

          {/* Thumbnail Generation */}
          {project.script && project.script.length > 50 && (
            <div className="bg-omega-panel border border-omega-border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-omega-text mb-1">Project Thumbnail</h3>
                  <p className="text-xs text-omega-text/50">
                    Generate a custom thumbnail image for your project based on your script and template style.
                  </p>
                </div>
                <button
                  onClick={handleRegenerateThumbnail}
                  disabled={generatingThumbnail}
                  className="px-4 py-2 bg-omega-accent/30 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/40 transition-all disabled:opacity-50 text-omega-text text-sm font-medium flex items-center gap-2"
                >
                  {generatingThumbnail ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>🖼️</span>
                      <span>{project.thumbnail ? 'Regenerate' : 'Generate'} Thumbnail</span>
                    </>
                  )}
                </button>
              </div>
              {(project.thumbnail || project.thumbnail_url) && (
                <div className="mt-3">
                  <img
                    src={project.thumbnail_url || project.thumbnail}
                    alt="Project thumbnail"
                    className="w-full max-w-xs rounded-md border border-omega-border shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Auto-generated Scenes Preview */}
          {project.scenes && project.scenes.length > 0 && (
            <div className="bg-omega-panel border border-omega-border rounded-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-omega-text">
                    Auto-Generated Scenes ({project.scenes.length})
                  </h3>
                  <span className="text-xs text-omega-text/40 bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    ✓ Ready
                  </span>
                </div>
                <Link
                  href={`/project/${id}/media`}
                  className="text-xs text-omega-accent hover:text-omega-accent/80 transition-colors"
                >
                  Edit in Media →
                </Link>
              </div>
              <p className="text-xs text-omega-text/50 mb-3">
                These scenes were automatically extracted from your script. Click "Edit in Media" to refine them with AI or generate video clips.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {project.scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className="bg-omega-bg border border-omega-border rounded-md p-3 hover:border-omega-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-omega-accent bg-omega-accent/20 px-1.5 py-0.5 rounded">
                        Scene {scene.number}
                      </span>
                      <span className="text-xs font-semibold text-omega-text">{scene.title}</span>
                    </div>
                    <p className="text-xs text-omega-text/60 line-clamp-2">{scene.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

