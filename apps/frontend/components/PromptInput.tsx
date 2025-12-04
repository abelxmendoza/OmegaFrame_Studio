'use client'

import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { generateClip } from '@/lib/api'
import { addClip } from '@/redux/projectSlice'
import { generatePromptFromScene } from '@/lib/sceneParser'
import { categorizeError, logError } from '@/lib/retry'

interface PromptInputProps {
  projectId: string
}

export default function PromptInput({ projectId }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState('pika')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null)
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const scenes = project?.scenes || []

  async function handleGenerateSingle() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError(null)
    
    try {
      const result = await generateClip(projectId, prompt, provider)
      
      // Check if we got a job ID (async generation) or direct URL (completed)
      if (result.job_id || result.task_id) {
        const jobId = result.job_id || result.task_id
        dispatch(
          addClip({
            projectId,
            clip: {
              path: '', // Will be set when polling completes
              url: undefined,
              prompt,
              provider,
              sceneId: null,
              jobId,
              generationStatus: 'processing',
            },
          })
        )
      } else if (result.clip || result.url) {
        // Direct completion
        dispatch(
          addClip({
            projectId,
            clip: {
              path: result.clip || result.url,
              url: result.clip || result.url,
              prompt,
              provider,
              sceneId: null,
              generationStatus: 'completed',
            },
          })
        )
      }
      setPrompt('')
    } catch (error: any) {
      logError('handleGenerateSingle', error, { projectId, provider })
      const errorInfo = categorizeError(error)
      setError({
        message: error.userMessage || errorInfo.message,
        retryable: error.retryable ?? errorInfo.retryable,
      })
    } finally {
      setGenerating(false)
    }
  }

  async function handleGenerateAllScenes() {
    if (scenes.length === 0) return
    setGenerating(true)
    setError(null)
    
    try {
      // Generate clips for all scenes in parallel
      const promises = scenes.map(async (scene) => {
        const scenePrompt = generatePromptFromScene(scene)
        const result = await generateClip(projectId, scenePrompt, provider)
        
        // Check if we got a job ID (async generation) or direct URL (completed)
        if (result.job_id || result.task_id) {
          const jobId = result.job_id || result.task_id
          return {
            path: '', // Will be set when polling completes
            url: undefined,
            prompt: scenePrompt,
            provider,
            sceneId: scene.id,
            sceneNumber: scene.number,
            jobId,
            generationStatus: 'processing' as const,
          }
        } else {
          return {
            path: result.clip || result.url,
            url: result.clip || result.url,
            prompt: scenePrompt,
            provider,
            sceneId: scene.id,
            sceneNumber: scene.number,
            generationStatus: 'completed' as const,
          }
        }
      })

      const clips = await Promise.all(promises)
      clips.forEach((clip) => {
        dispatch(addClip({ projectId, clip }))
      })
    } catch (error: any) {
      logError('handleGenerateAllScenes', error, { projectId, provider, sceneCount: scenes.length })
      const errorInfo = categorizeError(error)
      setError({
        message: error.userMessage || errorInfo.message,
        retryable: error.retryable ?? errorInfo.retryable,
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-omega-panel border border-omega-border p-6 rounded-md space-y-4">
      {/* Scene-based generation */}
      {scenes.length > 0 && (
        <div className="bg-omega-bg border border-omega-border rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-omega-text">
                Generate from {scenes.length} Scene{scenes.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-xs text-omega-text/60 mt-1">
                Generate video clips for all scenes at once. Each scene will use its prompt to create a matching video clip.
              </p>
            </div>
            <button
              onClick={handleGenerateAllScenes}
              disabled={generating}
              className="bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md shadow-omega-glow disabled:opacity-50 text-white text-sm font-semibold transition-all"
            >
              {generating ? 'Generating...' : `🎬 Generate All (${scenes.length})`}
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <select
              className="bg-omega-panel border border-omega-border p-2 rounded-md text-omega-text text-xs focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="pika">Pika</option>
              <option value="runway">Runway</option>
            </select>
          </div>
        </div>
      )}

      {/* Manual single clip generation */}
      <div>
        <h3 className="text-sm font-semibold text-omega-text mb-2">Or Generate Single Clip</h3>
        <p className="text-xs text-omega-text/50 mb-3">
          Create a custom clip with a detailed prompt. Be specific about visuals, camera movement, and style for best results.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your video clip in detail... (e.g., 'A cyberpunk cityscape at night with neon lights reflecting on wet streets, cinematic camera movement, slow pan')"
          className="w-full bg-omega-bg border border-omega-border p-3 h-28 rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 resize-none"
        />

        <div className="flex gap-4 mt-3">
          <select
            className="bg-omega-bg border border-omega-border p-2 rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="pika">Pika</option>
            <option value="runway">Runway</option>
          </select>

          <button
            onClick={handleGenerateSingle}
            disabled={generating || !prompt.trim()}
            className="bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md shadow-omega-glow disabled:opacity-50 text-white font-semibold transition-all"
          >
            {generating ? 'Generating...' : 'Generate Clip'}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
          <div className="flex items-start gap-2">
            <span className="text-red-400">⚠️</span>
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium mb-1">Generation Failed</p>
              <p className="text-xs text-omega-text/70 mb-2">{error.message}</p>
              {error.retryable && (
                <button
                  onClick={() => {
                    if (scenes.length > 0) {
                      handleGenerateAllScenes()
                    } else {
                      handleGenerateSingle()
                    }
                  }}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded transition-all"
                >
                  🔄 Retry
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

