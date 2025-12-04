'use client'

import { useState } from 'react'

interface ProjectTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
  const tabs = [
    { id: 'script', label: 'Script' },
    { id: 'media', label: 'Media' },
    { id: 'render', label: 'Render' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="flex space-x-1 border-b border-omega-border bg-omega-panel px-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-4 font-semibold text-sm transition-all relative ${
            activeTab === tab.id
              ? 'text-omega-accent border-b-2 border-omega-accent'
              : 'text-omega-text/60 hover:text-omega-text'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-omega-accent shadow-omega-glow" />
          )}
        </button>
      ))}
    </div>
  )
}

