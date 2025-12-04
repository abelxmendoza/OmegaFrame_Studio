'use client'

import { useState } from 'react'
import Logo from '@/components/Logo'
import VoiceRecorder from '@/components/VoiceRecorder'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import {
  setOpenAIApiKey,
  setElevenLabsApiKey,
  setPikaApiKey,
  setRunwayApiKey,
} from '@/redux/settingsSlice'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const [formData, setFormData] = useState({
    openai: settings.openaiApiKey || '',
    elevenlabs: settings.elevenlabsApiKey || '',
    pika: settings.pikaApiKey || '',
    runway: settings.runwayApiKey || '',
  })

  const handleSave = () => {
    dispatch(setOpenAIApiKey(formData.openai))
    dispatch(setElevenLabsApiKey(formData.elevenlabs))
    dispatch(setPikaApiKey(formData.pika))
    dispatch(setRunwayApiKey(formData.runway))
    // In a real app, this would save to localStorage or backend
    alert('Settings saved! (Note: In production, these would be stored securely)')
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Logo size="md" showText={false} className="hidden md:flex" />
        <div>
          <h1 className="text-3xl font-bold text-omega-text">Settings</h1>
          <p className="text-sm text-omega-text/50 mt-2 max-w-2xl">
            Configure API keys, voice settings, and video output preferences. These settings apply to all your projects.
          </p>
        </div>
      </div>
      
      <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-8">
          {/* API Keys Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-omega-text mb-2">API Keys</h2>
              <p className="text-sm text-omega-text/60">
                Configure your API keys to enable AI features. OpenAI is required for script generation and scene editing. 
                ElevenLabs is required for voice narration. Pika and Runway are optional for video generation.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  OpenAI API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={formData.openai}
                  onChange={(e) => setFormData({ ...formData, openai: e.target.value })}
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
                  placeholder="sk-..."
                />
                <p className="text-xs text-omega-text/50 mt-1">
                  Required for script generation and AI scene editing
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  ElevenLabs API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={formData.elevenlabs}
                  onChange={(e) => setFormData({ ...formData, elevenlabs: e.target.value })}
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
                  placeholder="..."
                />
                <p className="text-xs text-omega-text/50 mt-1">
                  Required for voice narration generation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Pika API Key <span className="text-omega-text/50">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={formData.pika}
                  onChange={(e) => setFormData({ ...formData, pika: e.target.value })}
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
                  placeholder="..."
                />
                <p className="text-xs text-omega-text/50 mt-1">
                  Optional: For video clip generation via Pika Labs
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Runway API Key <span className="text-omega-text/50">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={formData.runway}
                  onChange={(e) => setFormData({ ...formData, runway: e.target.value })}
                  className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50 focus:border-omega-accent"
                  placeholder="..."
                />
                <p className="text-xs text-omega-text/50 mt-1">
                  Optional: For video clip generation via Runway ML
                </p>
              </div>
            </div>
          </div>

          {/* Video Output Settings */}
          <div>
            <h2 className="text-xl font-semibold text-omega-text mb-4">Video Output Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Resolution
                </label>
                <select className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50">
                  <option>1080p</option>
                  <option>720p</option>
                  <option>4K</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  FPS
                </label>
                <select className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50">
                  <option>30fps</option>
                  <option>24fps</option>
                  <option>60fps</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-omega-text/80 mb-2">
                  Format
                </label>
                <select className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text focus:outline-none focus:ring-2 focus:ring-omega-accent/50">
                  <option>mp4</option>
                  <option>mov</option>
                  <option>webm</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Recording & Training */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-omega-text mb-2">Voice System</h2>
              <p className="text-sm text-omega-text/60 mb-2">
                <strong>Phase 1 (Active):</strong> Record and train your voice using ElevenLabs cloud cloning. 
                Fast, high-quality, ready now.
              </p>
              <p className="text-sm text-omega-text/60">
                <strong>Phase 2 (Coming Soon):</strong> Local XTTS-v2 training for offline, unlimited voice models. 
                Requires GPU (will be available when Alienware arrives).
              </p>
            </div>
            <VoiceRecorder />
          </div>

          {/* Paths */}
          <div>
            <h2 className="text-xl font-semibold text-omega-text mb-4">Paths</h2>
            <div>
              <label className="block text-sm font-medium text-omega-text/80 mb-2">
                Project Save Directory
              </label>
              <input
                type="text"
                value="./projects"
                readOnly
                className="w-full px-4 py-2 bg-omega-bg border border-omega-border rounded-md text-omega-text/60 font-mono text-sm"
              />
            </div>
          </div>

        <button
          onClick={handleSave}
          className="bg-omega-accent hover:bg-omega-accent/90 text-white font-semibold py-2 px-6 rounded-md transition-all shadow-omega-glow hover:shadow-omega-glow-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  )
}

