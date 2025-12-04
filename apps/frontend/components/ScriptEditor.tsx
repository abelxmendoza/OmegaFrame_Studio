'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateProjectScript } from '@/redux/projectSlice'
import { generateScript } from '@/redux/generationSlice'
import PromptInput from './PromptInput'

interface ScriptEditorProps {
  projectId: string
}

export default function ScriptEditor({ projectId }: ScriptEditorProps) {
  const dispatch = useAppDispatch()
  const { currentProject } = useAppSelector((state) => state.project)
  const { scriptGenerating } = useAppSelector((state) => state.generation)
  const [script, setScript] = useState(currentProject?.script || '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (currentProject?.script) {
      setScript(currentProject.script)
    }
  }, [currentProject])

  const handleGenerate = async () => {
    if (!currentProject?.topic) return
    const result = await dispatch(generateScript({ projectId, topic: currentProject.topic }))
    if (generateScript.fulfilled.match(result)) {
      setScript(result.payload.script)
    }
  }

  const handleSave = () => {
    if (script && projectId) {
      dispatch(updateProjectScript({ projectId, script }))
    }
  }

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md flex flex-col h-full min-h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-omega-border">
        <h2 className="text-xl font-semibold text-omega-text">Script Editor</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerate}
            disabled={scriptGenerating || !currentProject?.topic}
            className="bg-omega-accent hover:bg-omega-accent/90 text-white text-sm font-semibold py-2 px-4 rounded-md transition-all shadow-omega-glow disabled:opacity-50 disabled:shadow-none"
          >
            {scriptGenerating ? 'Generating with GPT...' : 'Generate with GPT'}
          </button>
          <button
            onClick={handleSave}
            className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 text-omega-text text-sm font-semibold py-2 px-4 rounded-md transition-all"
          >
            Save Script
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="INT. DARK CITY – NIGHT&#10;Neon lights flicker against rain-soaked streets...&#10;&#10;Your video script will appear here. Click 'Generate with GPT' to create one automatically."
          className="w-full h-full px-6 py-4 bg-omega-bg text-omega-text font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-omega-accent/50 border-0"
          style={{
            fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
            lineHeight: '1.6',
          }}
        />
        {script && (
          <div className="absolute bottom-4 right-4 text-xs text-omega-text/40">
            {script.split('\n').length} lines
          </div>
        )}
      </div>

      {!currentProject?.topic && (
        <div className="p-6 border-t border-omega-border">
          <PromptInput projectId={projectId} />
        </div>
      )}
    </div>
  )
}

