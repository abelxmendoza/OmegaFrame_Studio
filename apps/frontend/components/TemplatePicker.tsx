'use client'

import { useState } from 'react'
import { DEFAULT_TEMPLATES, getAllCategories } from '@/lib/templates'
import type { OFTemplate } from '@/shared/types'

interface TemplatePickerProps {
  onSelect: (template: OFTemplate) => void
  selectedTemplateId?: string
  className?: string
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

const categoryColors: Record<string, string> = {
  tech: 'border-blue-500/30 bg-blue-500/10',
  finance: 'border-yellow-500/30 bg-yellow-500/10',
  news: 'border-red-500/30 bg-red-500/10',
  story: 'border-purple-500/30 bg-purple-500/10',
  advice: 'border-green-500/30 bg-green-500/10',
  commentary: 'border-orange-500/30 bg-orange-500/10',
  documentary: 'border-cyan-500/30 bg-cyan-500/10',
  shorts: 'border-pink-500/30 bg-pink-500/10',
}

export default function TemplatePicker({ onSelect, selectedTemplateId, className = '' }: TemplatePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const categories = getAllCategories()

  const filteredTemplates = selectedCategory
    ? DEFAULT_TEMPLATES.filter((t) => t.category === selectedCategory)
    : DEFAULT_TEMPLATES

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            selectedCategory === null
              ? 'bg-omega-accent text-white'
              : 'bg-omega-panel border border-omega-border text-omega-text/70 hover:border-omega-accent/50'
          }`}
        >
          All Templates
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedCategory === category
                ? 'bg-omega-accent text-white'
                : 'bg-omega-panel border border-omega-border text-omega-text/70 hover:border-omega-accent/50'
            }`}
          >
            <span>{categoryIcons[category]}</span>
            <span className="capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selectedTemplateId === template.id
                ? 'border-omega-accent bg-omega-accent/10 shadow-omega-glow'
                : `${categoryColors[template.category]} hover:border-omega-accent/50`
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcons[template.category]}</span>
                <h3 className="font-semibold text-omega-text">{template.title}</h3>
              </div>
              {selectedTemplateId === template.id && (
                <span className="text-omega-accent text-lg">✓</span>
              )}
            </div>
            {template.description && (
              <p className="text-xs text-omega-text/60 mb-3">{template.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-omega-text/50">
              <span className="capitalize">{template.defaultLength}</span>
              <span>•</span>
              <span>{template.sceneStructure.length} scenes</span>
            </div>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-omega-text/60">
          <p>No templates found in this category.</p>
        </div>
      )}
    </div>
  )
}
