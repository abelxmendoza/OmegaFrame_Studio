'use client'

import { useState, useEffect } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { generateClip } from '@/lib/api'
import { updateClip, removeClip } from '@/redux/projectSlice'
import { useGenerationStatus } from '@/hooks/useGenerationStatus'
import { categorizeError, logError } from '@/lib/retry'
import VideoModal from './VideoModal'

interface ClipCardProps {
  projectId: string
  clipIndex: number
  clip: {
    path?: string
    url?: string
    prompt?: string
    provider?: string
    sceneId?: string
    sceneNumber?: number
    jobId?: string
    generationStatus?: 'processing' | 'completed' | 'failed' | 'error' | 'timeout'
  }
}

export default function ClipCard({ projectId, clipIndex, clip }: ClipCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editPrompt, setEditPrompt] = useState(clip.prompt || '')
  const [editProvider, setEditProvider] = useState(clip.provider || 'pika')
  const [regenerating, setRegenerating] = useState(false)
  const [errorDetails, setErrorDetails] = useState<{
    message: string
    retryable: boolean
  } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const dispatch = useAppDispatch()

  const videoSrc = clip.path || clip.url
  const provider = (clip.provider || 'pika') as 'pika' | 'runway'
  
  // Poll for status if we have a job ID and it's still processing
  const { status, isPolling, progress } = useGenerationStatus({
    jobId: clip.jobId || null,
    provider,
    enabled: !!clip.jobId && clip.generationStatus === 'processing',
    onComplete: (result) => {
      // Update clip with completed video URL
      dispatch(
        updateClip({
          projectId,
          clipIndex,
          clip: {
            ...clip,
            path: result.video_url || result.url,
            url: result.video_url || result.url,
            jobId: undefined,
            generationStatus: 'completed',
          },
        })
      )
    },
    onError: (result) => {
      // Update clip with error status
      dispatch(
        updateClip({
          projectId,
          clipIndex,
          clip: {
            ...clip,
            jobId: undefined,
            generationStatus: result.status,
          },
        })
      )
    },
  })

  // Update clip status when polling status changes (for progress updates)
  useEffect(() => {
    if (status && clip.jobId && status.status === 'processing' && status.status !== clip.generationStatus) {
      dispatch(
        updateClip({
          projectId,
          clipIndex,
          clip: {
            ...clip,
            generationStatus: status.status,
          },
        })
      )
    }
  }, [status?.status, status?.progress, clip.jobId, dispatch, projectId, clipIndex])

  async function handleRegenerate() {
    if (!editPrompt.trim()) return
    setRegenerating(true)
    setErrorDetails(null)
    
    try {
      const result = await generateClip(projectId, editPrompt, editProvider)
      
      // Check if we got a job ID (async generation) or direct URL (completed)
      if (result.job_id || result.task_id) {
        const jobId = result.job_id || result.task_id
        dispatch(
          updateClip({
            projectId,
            clipIndex,
            clip: {
              ...clip,
              prompt: editPrompt,
              provider: editProvider,
              jobId,
              generationStatus: 'processing',
              path: undefined, // Clear old path while generating
              url: undefined,
            },
          })
        )
      } else if (result.clip || result.url) {
        // Direct completion
        dispatch(
          updateClip({
            projectId,
            clipIndex,
            clip: {
              ...clip,
              path: result.clip || result.url,
              url: result.clip || result.url,
              prompt: editPrompt,
              provider: editProvider,
              jobId: undefined,
              generationStatus: 'completed',
            },
          })
        )
      }
      setIsEditing(false)
    } catch (error: any) {
      logError('handleRegenerate', error, { projectId, clipIndex, provider: editProvider })
      
      const errorInfo = categorizeError(error)
      setErrorDetails({
        message: error.userMessage || errorInfo.message,
        retryable: error.retryable ?? errorInfo.retryable,
      })
      
      dispatch(
        updateClip({
          projectId,
          clipIndex,
          clip: {
            ...clip,
            generationStatus: 'error',
          },
        })
      )
    } finally {
      setRegenerating(false)
    }
  }

  async function handleRetry() {
    if (!clip.prompt) return
    setRegenerating(true)
    setErrorDetails(null)
    
    try {
      const result = await generateClip(projectId, clip.prompt, clip.provider || 'pika')
      
      if (result.job_id || result.task_id) {
        const jobId = result.job_id || result.task_id
        dispatch(
          updateClip({
            projectId,
            clipIndex,
            clip: {
              ...clip,
              jobId,
              generationStatus: 'processing',
              path: undefined,
              url: undefined,
            },
          })
        )
      } else if (result.clip || result.url) {
        dispatch(
          updateClip({
            projectId,
            clipIndex,
            clip: {
              ...clip,
              path: result.clip || result.url,
              url: result.clip || result.url,
              jobId: undefined,
              generationStatus: 'completed',
            },
          })
        )
      }
    } catch (error: any) {
      logError('handleRetry', error, { projectId, clipIndex })
      const errorInfo = categorizeError(error)
      setErrorDetails({
        message: error.userMessage || errorInfo.message,
        retryable: error.retryable ?? errorInfo.retryable,
      })
    } finally {
      setRegenerating(false)
    }
  }

  function handleDelete() {
    if (confirm('Delete this clip?')) {
      dispatch(removeClip({ projectId, clipIndex }))
    }
  }

  async function handleDownload() {
    if (!videoSrc) return
    setIsDownloading(true)
    try {
      // Construct full URL
      const pythonRenderUrl = process.env.NEXT_PUBLIC_PYTHON_RENDER_URL || 'http://localhost:8000'
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      
      const getFullUrl = (url: string) => {
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        if (url.startsWith('/renders/') || url.startsWith('/clips/')) return `${pythonRenderUrl}${url}`
        if (supabaseUrl && url.includes('supabase.co')) return url
        return `${pythonRenderUrl}/${url}`
      }

      const fullUrl = getFullUrl(videoSrc)
      const response = await fetch(fullUrl)
      if (!response.ok) throw new Error('Failed to fetch video')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clip-${clipIndex + 1}-${clip.prompt?.slice(0, 20).replace(/[^a-z0-9]/gi, '-') || 'video'}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading clip:', error)
      alert('Failed to download clip. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const getFullUrl = (url: string) => {
    if (!url) return ''
    const pythonRenderUrl = process.env.NEXT_PUBLIC_PYTHON_RENDER_URL || 'http://localhost:8000'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/renders/') || url.startsWith('/clips/')) return `${pythonRenderUrl}${url}`
    if (supabaseUrl && url.includes('supabase.co')) return url
    return `${pythonRenderUrl}/${url}`
  }

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md overflow-hidden group hover:border-omega-accent/50 transition-all">
      {/* Video/Placeholder */}
      <div className="relative">
        {videoSrc ? (
          <div
            className="relative w-full aspect-video bg-omega-bg cursor-pointer group overflow-hidden"
            onClick={() => setShowModal(true)}
          >
            <video
              src={getFullUrl(videoSrc)}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              poster={clip.thumbnail ? getFullUrl(clip.thumbnail) : undefined}
            />
            {/* Overlay with play button */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center gap-2 transform group-hover:scale-110">
                <div className="bg-omega-accent/90 rounded-full p-4 shadow-omega-glow">
                  <span className="text-white text-3xl block">▶</span>
                </div>
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Click to preview</span>
              </div>
            </div>
            {/* Thumbnail badge */}
            {clip.thumbnail && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                📷
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-video bg-omega-bg border-b border-omega-border flex items-center justify-center relative overflow-hidden">
            {clip.generationStatus === 'processing' || isPolling ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                <div className="w-12 h-12 border-4 border-omega-accent border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium text-omega-text">
                    Generating video...
                  </p>
                  {progress > 0 && (
                    <p className="text-xs text-omega-text/60 mt-1">
                      {Math.round(progress)}% complete
                    </p>
                  )}
                  {status?.message && (
                    <p className="text-xs text-omega-text/50 mt-1">
                      {status.message}
                    </p>
                  )}
                </div>
                {progress > 0 && (
                  <div className="w-full max-w-xs h-1.5 bg-omega-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-omega-accent transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : clip.generationStatus === 'failed' || clip.generationStatus === 'error' || clip.generationStatus === 'timeout' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 bg-omega-bg/95">
                <span className="text-3xl">⚠️</span>
                <div className="text-center">
                  <p className="text-sm font-medium text-red-400 mb-1">
                    Generation Failed
                  </p>
                  <p className="text-xs text-omega-text/70 mb-3 max-w-xs">
                    {errorDetails?.message || status?.error || 'An error occurred while generating the video'}
                  </p>
                  {errorDetails?.retryable !== false && (
                    <button
                      onClick={handleRetry}
                      disabled={regenerating}
                      className="bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md text-white text-xs font-semibold disabled:opacity-50 transition-all"
                    >
                      {regenerating ? 'Retrying...' : '🔄 Retry'}
                    </button>
                  )}
                  {errorDetails?.retryable === false && (
                    <p className="text-xs text-omega-text/50 mt-2">
                      This error cannot be retried. Please check your settings.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-omega-text/30">No video</span>
            )}
          </div>
        )}

        {/* Scene badge */}
        {clip.sceneNumber && (
          <div className="absolute top-2 left-2 bg-omega-accent/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-lg backdrop-blur-sm z-10">
            Scene {clip.sceneNumber}
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 z-10">
          {videoSrc && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              disabled={isDownloading}
              className="bg-omega-accent/90 hover:bg-omega-accent text-white text-xs px-2.5 py-1.5 rounded-md transition-all disabled:opacity-50 shadow-lg hover:shadow-omega-glow backdrop-blur-sm"
              title="Download clip"
            >
              {isDownloading ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>⬇️</span>
              )}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(!isEditing)
            }}
            className="bg-omega-panel/95 backdrop-blur-sm border border-omega-border hover:border-omega-accent/50 text-omega-text text-xs px-2.5 py-1.5 rounded-md transition-all shadow-lg"
            title="Edit clip"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="bg-red-500/90 hover:bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-md transition-all shadow-lg hover:shadow-red-500/50 backdrop-blur-sm"
            title="Delete clip"
          >
            ×
          </button>
        </div>
      </div>

      {/* Prompt display/edit */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="w-full bg-omega-bg border border-omega-border rounded-md px-2 py-1.5 text-omega-text text-xs focus:outline-none focus:ring-2 focus:ring-omega-accent/50 resize-none h-16"
              placeholder="Edit prompt..."
            />
            <div className="flex gap-2">
              <select
                className="flex-1 bg-omega-bg border border-omega-border rounded-md px-2 py-1.5 text-omega-text text-xs focus:outline-none"
                value={editProvider}
                onChange={(e) => setEditProvider(e.target.value)}
              >
                <option value="pika">Pika</option>
                <option value="runway">Runway</option>
              </select>
              <button
                onClick={handleRegenerate}
                disabled={regenerating || !editPrompt.trim()}
                className="bg-omega-accent hover:bg-omega-accent/90 px-3 py-1.5 rounded-md text-white text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {regenerating ? '...' : 'Regenerate'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 px-3 py-1.5 rounded-md text-omega-text text-xs transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-omega-text/70 line-clamp-2 mb-1">
              {clip.prompt || 'No prompt'}
            </p>
            {clip.provider && (
              <span className="text-xs text-omega-text/50">{clip.provider}</span>
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {showModal && videoSrc && (
        <VideoModal
          videoUrl={videoSrc}
          thumbnail={clip.thumbnail}
          title={clip.prompt || `Clip ${clipIndex + 1}`}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

