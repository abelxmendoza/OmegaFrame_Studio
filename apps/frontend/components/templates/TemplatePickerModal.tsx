'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { DEFAULT_TEMPLATES, getAllCategories } from '@/lib/templates'
import { createProjectFromTemplate } from '@/lib/templates/applyTemplate'
import type { OFTemplate } from '@/shared/types'
import { useRouter } from 'next/navigation'

interface TemplatePickerModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const categoryIcons: Record<string, string> = {
  tech: '💻',
  finance: '💰',
  news: '📰',
  story: '🎬',
  advice: '💡',
  commentary: '💬',
  documentary: '📹',
  shorts: '⚡',
}

export default function TemplatePickerModal({ open, setOpen }: TemplatePickerModalProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)
  const categories = getAllCategories()

  const filteredTemplates = selectedCategory
    ? DEFAULT_TEMPLATES.filter((t) => t.category === selectedCategory)
    : DEFAULT_TEMPLATES

  async function handleSelectTemplate(template: OFTemplate) {
    setCreating(template.id)
    try {
      const projectId = await createProjectFromTemplate(template)
      setOpen(false)
      router.push(`/project/${projectId}`)
    } catch (error) {
      console.error('Error creating project from template:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setCreating(null)
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-5xl max-h-[85vh] bg-omega-panel border border-omega-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-omega-border">
                <Dialog.Title className="text-3xl font-bold text-omega-text mb-2">
                  Choose a Template
                </Dialog.Title>
                <p className="text-sm text-omega-text/60">
                  Select a template to get started quickly. Templates include pre-structured scripts,
                  scene prompts, and recommended voice settings.
                </p>
              </div>

              {/* Category Tabs */}
              <div className="px-6 pt-4 pb-2 border-b border-omega-border">
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
                      selectedCategory === null
                        ? 'bg-omega-accent text-white border-omega-accent'
                        : 'bg-omega-bg border-omega-border text-omega-text/70 hover:border-omega-accent/50'
                    }`}
                  >
                    All Templates
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap flex items-center gap-2 ${
                        selectedCategory === cat
                          ? 'bg-omega-accent text-white border-omega-accent'
                          : 'bg-omega-bg border-omega-border text-omega-text/70 hover:border-omega-accent/50'
                      }`}
                    >
                      <span>{categoryIcons[cat]}</span>
                      <span className="capitalize">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => handleSelectTemplate(template)}
                      isCreating={creating === template.id}
                    />
                  ))}
                </div>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-omega-text/60">
                    <p>No templates found in this category.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-omega-border flex justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 text-omega-text rounded-md transition-all"
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

interface TemplateCardProps {
  template: OFTemplate
  onSelect: () => void
  isCreating: boolean
}

function TemplateCard({ template, onSelect, isCreating }: TemplateCardProps) {
  const categoryIcon = categoryIcons[template.category] || '📄'

  return (
    <div className="bg-omega-bg border border-omega-border rounded-xl p-4 hover:border-omega-accent/50 transition-all flex flex-col">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{categoryIcon}</span>
          <h3 className="text-lg font-semibold text-omega-text">{template.title}</h3>
        </div>
        <p className="text-xs text-omega-text/50 capitalize mb-2">{template.category}</p>
        {template.description && (
          <p className="text-xs text-omega-text/60 mb-3">{template.description}</p>
        )}
      </div>

      {/* Script Preview */}
      <div className="bg-omega-panel border border-omega-border rounded-md p-3 mb-3 flex-1 overflow-hidden">
        <pre className="text-xs text-omega-text/70 font-mono whitespace-pre-wrap line-clamp-4">
          {template.scriptStructure.slice(0, 200)}
          {template.scriptStructure.length > 200 && '...'}
        </pre>
      </div>

      {/* Template Info */}
      <div className="flex items-center justify-between text-xs text-omega-text/50 mb-3">
        <span>{template.sceneStructure.length} scenes</span>
        <span className="capitalize">{template.defaultLength}</span>
      </div>

      {/* Use Template Button */}
      <button
        onClick={onSelect}
        disabled={isCreating}
        className="w-full py-2 bg-omega-accent hover:bg-omega-accent/90 text-white rounded-md border border-omega-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isCreating ? 'Creating...' : 'Use Template'}
      </button>
    </div>
  )
}
