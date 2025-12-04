'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/redux/hooks'
import { addProject, setScenes } from '@/redux/projectSlice'
import { v4 as uuidv4 } from 'uuid'
import TemplatePicker from '@/components/TemplatePicker'
import type { OFTemplate } from '@/shared/types'
import Sidebar from '@/components/Sidebar'
import { generateThumbnail } from '@/lib/api'

export default function NewProjectPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<OFTemplate | null>(null)
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [loading, setLoading] = useState(false)

  const handleTemplateSelect = (template: OFTemplate) => {
    setSelectedTemplate(template)
    // Auto-fill topic if empty
    if (!topic.trim()) {
      setTopic(`Create a ${template.title.toLowerCase()} video`)
    }
    // Auto-fill name if empty
    if (!name.trim()) {
      setName(template.title)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !topic.trim()) return

    setLoading(true)
    try {
      const id = uuidv4()
      dispatch(
        addProject({
          id,
          name: name.trim(),
          topic: topic.trim(),
          clips: [],
          script: selectedTemplate?.scriptStructure || '',
          templateId: selectedTemplate?.id,
          voiceId: selectedTemplate?.defaultVoice,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      )

      // If template has scenes, create them
      if (selectedTemplate?.sceneStructure) {
        const scenes = selectedTemplate.sceneStructure.map((scene, index) => ({
          id: uuidv4(),
          number: index + 1,
          title: scene.title,
          description: scene.description,
          prompt: scene.prompt,
        }))
        dispatch(setScenes({ projectId: id, scenes }))
      }

      // Generate thumbnail asynchronously (don't block navigation)
      const initialScript = selectedTemplate?.scriptStructure || ''
      if (initialScript && initialScript.length > 0) {
        generateThumbnail(id, initialScript, selectedTemplate?.id).catch((error) => {
          console.error('Error generating thumbnail:', error)
          // Thumbnail generation failure shouldn't block project creation
        })
      }

      router.push(`/project/${id}`)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-omega-bg">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-omega-text mb-6">Create New Project</h1>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setStep('template')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                step === 'template'
                  ? 'bg-omega-accent text-white'
                  : selectedTemplate
                  ? 'bg-omega-panel border border-omega-accent/50 text-omega-text'
                  : 'bg-omega-panel border border-omega-border text-omega-text/60'
              }`}
            >
              1. Choose Template {selectedTemplate && '✓'}
            </button>
            <div className="h-px w-8 bg-omega-border" />
            <button
              onClick={() => selectedTemplate && setStep('details')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                step === 'details'
                  ? 'bg-omega-accent text-white'
                  : 'bg-omega-panel border border-omega-border text-omega-text/60'
              } ${!selectedTemplate ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              2. Project Details
            </button>
          </div>

          {step === 'template' ? (
            <div className="bg-omega-panel border border-omega-border rounded-md p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-omega-text mb-2">Choose a Template</h2>
                <p className="text-sm text-omega-text/60">
                  Select a template to get started quickly. Templates include pre-structured scripts,
                  scene prompts, and recommended voice settings.
                </p>
              </div>
              <TemplatePicker
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
              {selectedTemplate && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setStep('details')}
                    className="bg-omega-accent hover:bg-omega-accent/90 text-white font-semibold py-2 px-6 rounded-md transition-all shadow-omega-glow"
                  >
                    Continue to Details →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-6">
              {selectedTemplate && (
                <div className="bg-omega-accent/10 border border-omega-accent/30 rounded-md p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-omega-text">Selected Template</p>
                      <p className="text-xs text-omega-text/70 mt-1">{selectedTemplate.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('template')}
                      className="text-xs text-omega-accent hover:text-omega-accent/80"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cyberpunk Streets Montage"
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Video Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe what your video will be about..."
                  rows={4}
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent resize-none"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep('template')}
                  className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 text-omega-text font-semibold py-2 px-6 rounded-md transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-omega-accent hover:bg-omega-accent/90 text-white font-semibold py-2 px-6 rounded-md transition-all shadow-omega-glow hover:shadow-omega-glow-lg disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 text-omega-text font-semibold py-2 px-6 rounded-md transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

