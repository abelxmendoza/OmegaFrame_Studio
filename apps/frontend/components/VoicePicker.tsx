'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateProjectVoice } from '@/redux/projectSlice'
import { listClonedVoices } from '@/lib/api'
import { setClonedVoices } from '@/redux/settingsSlice'

interface Voice {
  id: string
  name: string
  description: string
  accent?: string
  gender?: string
  category?: string
}

// Popular ElevenLabs voices organized by category
const AVAILABLE_VOICES: Voice[] = [
  // Female Voices
  {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel
    name: 'Rachel',
    description: 'Calm, soothing female voice',
    accent: 'American',
    gender: 'Female',
    category: 'Narrative',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld', // Domi
    name: 'Domi',
    description: 'Strong, confident female voice',
    accent: 'American',
    gender: 'Female',
    category: 'Professional',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    name: 'Bella',
    description: 'Soft, warm female voice',
    accent: 'American',
    gender: 'Female',
    category: 'Conversational',
  },
  {
    id: 'MF3mGyEYCl7XYWbV9V6O', // Elli
    name: 'Elli',
    description: 'Young, energetic female voice',
    accent: 'American',
    gender: 'Female',
    category: 'Energetic',
  },
  {
    id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy
    name: 'Dorothy',
    description: 'Mature, wise female voice',
    accent: 'American',
    gender: 'Female',
    category: 'Mature',
  },
  // Male Voices
  {
    id: 'ErXwobaYiN019PkySvjV', // Antoni
    name: 'Antoni',
    description: 'Deep, clear male voice',
    accent: 'American',
    gender: 'Male',
    category: 'Professional',
  },
  {
    id: 'TxGEqnHWrfWFTfGW9XjX', // Josh
    name: 'Josh',
    description: 'Deep, authoritative male voice',
    accent: 'American',
    gender: 'Male',
    category: 'Authoritative',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG', // Arnold
    name: 'Arnold',
    description: 'Strong, commanding male voice',
    accent: 'American',
    gender: 'Male',
    category: 'Commanding',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam
    name: 'Adam',
    description: 'Deep, resonant male voice',
    accent: 'American',
    gender: 'Male',
    category: 'Deep',
  },
  {
    id: 'yoZ06aMxZJJ28mfd3POQ', // Sam
    name: 'Sam',
    description: 'Friendly, conversational male voice',
    accent: 'American',
    gender: 'Male',
    category: 'Conversational',
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9', // Daniel
    name: 'Daniel',
    description: 'British male voice, calm and serious',
    accent: 'British',
    gender: 'Male',
    category: 'British',
  },
]

interface VoicePickerProps {
  projectId: string
}

export default function VoicePicker({ projectId }: VoicePickerProps) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const settings = useAppSelector((state) => state.settings)
  const project = projects[projectId]
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGender, setFilterGender] = useState<string | null>(null)

  // Load cloned voices on mount (only if not already loaded)
  useEffect(() => {
    // Only load from API if we don't have any cloned voices yet
    // This allows mock data to persist
    if (settings.clonedVoices.length === 0) {
      const loadClonedVoices = async () => {
        try {
          const result = await listClonedVoices()
          if (result.voices && result.voices.length > 0) {
            dispatch(setClonedVoices(result.voices))
          }
        } catch (error) {
          console.error('Error loading cloned voices:', error)
          // Silently fail - mock data will be used
        }
      }
      loadClonedVoices()
    }
  }, [dispatch, settings.clonedVoices.length])

  // Check if custom voice is selected
  const isCustomVoice = project?.voiceId === 'custom-voice'
  const selectedVoiceId = project?.voiceId || AVAILABLE_VOICES[0].id
  
  // Find selected voice from all available sources
  const selectedVoice = useMemo(() => {
    if (isCustomVoice) {
      return {
        id: 'custom-voice',
        name: settings.customVoiceName || 'Your Voice',
        description: 'Your recorded voice',
        gender: 'Custom',
        category: 'Recorded',
      }
    }
    
    // Check cloned voices
    const clonedVoice = settings.clonedVoices.find((v) => v.voice_id === selectedVoiceId)
    if (clonedVoice) {
      return {
        id: clonedVoice.voice_id,
        name: clonedVoice.name,
        description: clonedVoice.description || `Cloned voice: ${clonedVoice.name}`,
        gender: 'Cloned',
        category: clonedVoice.provider === 'elevenlabs' ? 'ElevenLabs Clone' : 'Local Clone',
      }
    }
    
    // Check default voices
    return AVAILABLE_VOICES.find((v) => v.id === selectedVoiceId) || AVAILABLE_VOICES[0]
  }, [selectedVoiceId, isCustomVoice, settings.customVoiceName, settings.clonedVoices])

  // Filter voices based on search and gender
  const filteredVoices = useMemo(() => {
    // Convert cloned voices to Voice format
    const clonedVoicesList: Voice[] = settings.clonedVoices.map((cv) => ({
      id: cv.voice_id,
      name: cv.name,
      description: cv.description || `Cloned voice: ${cv.name}`,
      gender: 'Cloned',
      category: cv.provider === 'elevenlabs' ? 'ElevenLabs Clone' : 'Local Clone',
    }))

    // Build voice list: Custom recorded -> Cloned voices -> Default voices
    const allVoices: Voice[] = []
    
    // Add custom recorded voice if exists
    if (settings.customVoiceAudio) {
      allVoices.push({
        id: 'custom-voice',
        name: settings.customVoiceName || 'Your Voice',
        description: 'Your recorded voice (not trained)',
        gender: 'Custom',
        category: 'Recorded',
      } as Voice)
    }

    // Add cloned voices
    allVoices.push(...clonedVoicesList)

    // Add default ElevenLabs voices
    allVoices.push(...AVAILABLE_VOICES)

    return allVoices.filter((voice) => {
      const matchesSearch =
        searchQuery === '' ||
        voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        voice.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesGender =
        !filterGender || 
        voice.gender === filterGender || 
        voice.gender === 'Custom' || 
        voice.gender === 'Cloned'
      return matchesSearch && matchesGender
    })
  }, [searchQuery, filterGender, settings.customVoiceAudio, settings.customVoiceName, settings.clonedVoices])

  // Group voices by category
  const voicesByCategory = useMemo(() => {
    const grouped: Record<string, Voice[]> = {}
    
    // Separate voices by category
    const customVoice = filteredVoices.find((v) => v.id === 'custom-voice')
    const clonedVoices = filteredVoices.filter((v) => 
      v.category === 'ElevenLabs Clone' || v.category === 'Local Clone'
    )
    const defaultVoices = filteredVoices.filter((v) => 
      v.id !== 'custom-voice' && 
      v.category !== 'ElevenLabs Clone' && 
      v.category !== 'Local Clone'
    )

    if (customVoice) {
      grouped['Your Voice'] = [customVoice]
    }
    if (clonedVoices.length > 0) {
      grouped['Cloned Voices'] = clonedVoices
    }
    if (defaultVoices.length > 0) {
      // Group default voices by gender
      defaultVoices.forEach((voice) => {
        const gender = voice.gender || 'Other'
        if (!grouped[gender]) {
          grouped[gender] = []
        }
        grouped[gender].push(voice)
      })
    }
    
    return grouped
  }, [filteredVoices])

  const handleSelectVoice = (voiceId: string) => {
    dispatch(updateProjectVoice({ projectId, voiceId }))
    setIsOpen(false)
    setSearchQuery('')
    setFilterGender(null)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md px-4 py-3 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-omega-accent/20 border border-omega-accent/30 rounded-full flex items-center justify-center group-hover:bg-omega-accent/30 transition-colors">
            <span className="text-omega-accent text-lg">🎤</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-omega-text">{selectedVoice.name}</div>
            <div className="text-xs text-omega-text/60">{selectedVoice.description}</div>
          </div>
        </div>
        <span className="text-omega-text/40 transition-transform">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false)
              setSearchQuery('')
              setFilterGender(null)
            }}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-omega-panel border border-omega-border rounded-md shadow-lg z-20 max-h-[500px] overflow-hidden flex flex-col">
            {/* Search and Filter */}
            <div className="p-3 border-b border-omega-border space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voices..."
                className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilterGender(null)
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterGender === null
                      ? 'bg-omega-accent text-white'
                      : 'bg-omega-bg border border-omega-border text-omega-text/70 hover:text-omega-text'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilterGender('Female')
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterGender === 'Female'
                      ? 'bg-omega-accent text-white'
                      : 'bg-omega-bg border border-omega-border text-omega-text/70 hover:text-omega-text'
                  }`}
                >
                  Female
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFilterGender('Male')
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    filterGender === 'Male'
                      ? 'bg-omega-accent text-white'
                      : 'bg-omega-bg border border-omega-border text-omega-text/70 hover:text-omega-text'
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            {/* Voice List */}
            <div className="overflow-y-auto max-h-[400px]">
              {Object.keys(voicesByCategory).length === 0 ? (
                <div className="p-6 text-center text-omega-text/60 text-sm">
                  No voices found
                </div>
              ) : (
                Object.entries(voicesByCategory).map(([category, voices]) => (
                  <div key={category} className="p-2">
                    {Object.keys(voicesByCategory).length > 1 && (
                      <div className="px-3 py-2 text-xs font-semibold text-omega-text/50 uppercase tracking-wide flex items-center gap-2">
                        {category === 'Cloned Voices' && <span>🚀</span>}
                        {category === 'Your Voice' && <span>🎤</span>}
                        {category}
                      </div>
                    )}
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => handleSelectVoice(voice.id)}
                        className={`w-full text-left p-3 rounded-md transition-all mb-1 ${
                          selectedVoiceId === voice.id
                            ? 'bg-omega-accent/20 border border-omega-accent/50'
                            : 'hover:bg-omega-bg border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selectedVoiceId === voice.id
                                ? 'bg-omega-accent/30 border border-omega-accent/50'
                                : 'bg-omega-bg border border-omega-border'
                            }`}
                          >
                            {selectedVoiceId === voice.id ? (
                              <span className="text-omega-accent text-sm font-bold">✓</span>
                            ) : voice.id === 'custom-voice' ? (
                              <span className="text-omega-accent text-lg">🎤</span>
                            ) : voice.category === 'ElevenLabs Clone' || voice.category === 'Local Clone' ? (
                              <span className="text-omega-accent text-sm">🚀</span>
                            ) : (
                              <span className="text-omega-text/40 text-xs">
                                {voice.gender === 'Female' ? '♀' : voice.gender === 'Male' ? '♂' : '○'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-omega-text">
                                {voice.name}
                              </span>
                              {voice.category && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded ${
                                    voice.category === 'ElevenLabs Clone'
                                      ? 'text-omega-accent bg-omega-accent/20'
                                      : voice.category === 'Local Clone'
                                      ? 'text-purple-400 bg-purple-500/20'
                                      : 'text-omega-text/50 bg-omega-bg'
                                  }`}
                                >
                                  {voice.category === 'ElevenLabs Clone' && '🚀 '}
                                  {voice.category === 'Local Clone' && '⚡ '}
                                  {voice.category}
                                </span>
                              )}
                              {voice.accent && voice.accent !== 'American' && (
                                <span className="text-xs text-omega-text/40 px-1.5 py-0.5 bg-omega-bg/50 rounded">
                                  {voice.accent}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-omega-text/60 mt-0.5">
                              {voice.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

