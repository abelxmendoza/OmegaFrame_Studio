'use client'

import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { generateImage, generateVideo, removeMediaItem } from '@/redux/generationSlice'

interface MediaPreviewProps {
  projectId: string
}

export default function MediaPreview({ projectId }: MediaPreviewProps) {
  const dispatch = useAppDispatch()
  const { mediaItems, imageGenerating, videoGenerating } = useAppSelector((state) => state.generation)
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState<'pika' | 'runway'>('pika')
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    await dispatch(
      generateVideo({ projectId, prompt, provider })
    )
    setPrompt('')
  }

  const handleRemove = (mediaId: string) => {
    dispatch(removeMediaItem(mediaId))
  }

  const videoClips = mediaItems.filter((item) => item.type === 'video')

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md flex flex-col h-full min-h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-omega-border">
        <h2 className="text-xl font-semibold text-omega-text mb-4">Media Generator</h2>
        
        {/* Prompt Input */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter video prompt (e.g., Cyberpunk alley at night, neon lights reflecting on wet streets)"
              className="w-full px-4 py-3 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-omega-text/80">Provider:</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'pika' | 'runway')}
                className="px-3 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
              >
                <option value="pika">Pika</option>
                <option value="runway">Runway</option>
              </select>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || videoGenerating}
              className="bg-omega-accent hover:bg-omega-accent/90 text-white font-semibold py-2 px-6 rounded-md transition-all shadow-omega-glow disabled:opacity-50 disabled:shadow-none"
            >
              {videoGenerating ? 'Generating Clip...' : 'Generate Clip'}
            </button>
          </div>
        </div>
      </div>

      {/* Clip Gallery */}
      <div className="flex-1 overflow-y-auto p-6">
        {videoClips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-omega-text/60 mb-2">No clips generated yet</p>
            <p className="text-sm text-omega-text/40">Enter a prompt above and click Generate Clip</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {videoClips.map((item) => (
              <div
                key={item.id}
                className="bg-omega-bg border border-omega-border rounded-md overflow-hidden hover:border-omega-accent/50 transition-all group"
              >
                <div
                  className="relative aspect-video bg-omega-panel cursor-pointer"
                  onClick={() => setSelectedMedia(item.id)}
                >
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 text-white text-2xl">▶</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-omega-text/80 line-clamp-2 mb-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-omega-text/40">{item.provider}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for selected media */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {videoClips.find((item) => item.id === selectedMedia) && (
              <video
                src={videoClips.find((item) => item.id === selectedMedia)?.url}
                controls
                autoPlay
                className="w-full rounded-md"
              />
            )}
            <button
              onClick={() => setSelectedMedia(null)}
              className="mt-4 text-omega-text hover:text-omega-accent transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

