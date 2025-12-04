'use client'

import { useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { updateSEO } from '@/redux/projectSlice'
import { generateSEO } from '@/lib/api'

interface SEOPanelProps {
  project: {
    id: string
    script?: string
    seoTitle?: string
    seoDescription?: string
    seoTags?: string[]
    seoHashtags?: string[]
    seoChapters?: Array<{ time: string; title: string }>
  }
}

export default function SEOPanel({ project }: SEOPanelProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  async function runOperation(op: string) {
    if (!project.script || project.script.length < 50) {
      setError('Please write or generate a script first (at least 50 characters)')
      return
    }

    setLoading(op)
    setError(null)

    try {
      const result = await generateSEO(project.id, project.script, op)

      // Update Redux state based on operation
      if (op === 'title') {
        dispatch(
          updateSEO({
            projectId: project.id,
            seoTitle: result.primaryTitle || result.titles?.[0],
          })
        )
      } else if (op === 'description') {
        dispatch(
          updateSEO({
            projectId: project.id,
            seoDescription: result.description,
          })
        )
      } else if (op === 'tags') {
        dispatch(
          updateSEO({
            projectId: project.id,
            seoTags: result.tags,
          })
        )
      } else if (op === 'hashtags') {
        dispatch(
          updateSEO({
            projectId: project.id,
            seoHashtags: result.hashtags,
          })
        )
      } else if (op === 'chapters') {
        dispatch(
          updateSEO({
            projectId: project.id,
            seoChapters: result.chapters,
          })
        )
      }
    } catch (err: any) {
      console.error(`Error generating ${op}:`, err)
      setError(err.userMessage || `Failed to generate ${op}`)
    } finally {
      setLoading('')
    }
  }

  const hasScript = project.script && project.script.length >= 50

  return (
    <div className="bg-omega-panel border border-omega-border rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-omega-text mb-2">SEO Publishing Suite</h2>
        <p className="text-sm text-omega-text/60">
          Generate optimized titles, descriptions, tags, hashtags, and chapters for YouTube publishing.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-md p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!hasScript && (
        <div className="bg-omega-accent/10 border border-omega-accent/30 rounded-md p-3 text-sm text-omega-text/60">
          ⚠️ Write or generate a script first (at least 50 characters) to use SEO tools.
        </div>
      )}

      {/* Generation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={() => runOperation('title')}
          disabled={!hasScript || loading !== ''}
          className="px-4 py-3 bg-omega-accent/20 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-omega-text text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading === 'title' ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📝</span>
              <span>Generate Title</span>
            </>
          )}
        </button>

        <button
          onClick={() => runOperation('chapters')}
          disabled={!hasScript || loading !== ''}
          className="px-4 py-3 bg-omega-accent/20 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-omega-text text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading === 'chapters' ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📑</span>
              <span>Generate Chapters</span>
            </>
          )}
        </button>

        <button
          onClick={() => runOperation('description')}
          disabled={!hasScript || loading !== ''}
          className="px-4 py-3 bg-omega-accent/20 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-omega-text text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading === 'description' ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Generate Description</span>
            </>
          )}
        </button>

        <button
          onClick={() => runOperation('tags')}
          disabled={!hasScript || loading !== ''}
          className="px-4 py-3 bg-omega-accent/20 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-omega-text text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading === 'tags' ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>🏷️</span>
              <span>Generate Tags</span>
            </>
          )}
        </button>

        <button
          onClick={() => runOperation('hashtags')}
          disabled={!hasScript || loading !== ''}
          className="px-4 py-3 bg-omega-accent/20 border border-omega-accent/40 rounded-lg hover:bg-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-omega-text text-sm font-medium flex items-center justify-center gap-2"
        >
          {loading === 'hashtags' ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>#️⃣</span>
              <span>Generate Hashtags</span>
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {(project.seoTitle ||
        project.seoDescription ||
        project.seoTags?.length ||
        project.seoHashtags?.length ||
        project.seoChapters?.length) && (
        <div className="mt-6 space-y-4 border-t border-omega-border pt-6">
          <h3 className="text-lg font-semibold text-omega-text">Preview</h3>

          {project.seoTitle && (
            <div>
              <label className="text-xs text-omega-text/60 font-medium mb-1 block">Title</label>
              <p className="text-sm text-omega-text bg-omega-bg border border-omega-border rounded-md p-3">
                {project.seoTitle}
              </p>
              <p className="text-xs text-omega-text/40 mt-1">
                {project.seoTitle.length} / 55 characters
              </p>
            </div>
          )}

          {project.seoDescription && (
            <div>
              <label className="text-xs text-omega-text/60 font-medium mb-1 block">
                Description
              </label>
              <p className="text-sm text-omega-text bg-omega-bg border border-omega-border rounded-md p-3 whitespace-pre-wrap">
                {project.seoDescription}
              </p>
            </div>
          )}

          {project.seoTags && project.seoTags.length > 0 && (
            <div>
              <label className="text-xs text-omega-text/60 font-medium mb-1 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {project.seoTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-omega-accent/20 text-omega-accent px-2 py-1 rounded border border-omega-accent/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.seoHashtags && project.seoHashtags.length > 0 && (
            <div>
              <label className="text-xs text-omega-text/60 font-medium mb-1 block">Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {project.seoHashtags.map((hashtag, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-omega-accent/20 text-omega-accent px-2 py-1 rounded border border-omega-accent/30"
                  >
                    {hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.seoChapters && project.seoChapters.length > 0 && (
            <div>
              <label className="text-xs text-omega-text/60 font-medium mb-1 block">Chapters</label>
              <div className="bg-omega-bg border border-omega-border rounded-md p-3 space-y-2">
                {project.seoChapters.map((chapter, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-omega-text">
                    <span className="font-mono text-omega-accent min-w-[60px]">
                      {chapter.time}
                    </span>
                    <span>{chapter.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
