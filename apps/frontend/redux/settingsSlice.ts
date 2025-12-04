import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ClonedVoice {
  voice_id: string
  name: string
  description?: string
  type: 'cloud' | 'local'
  provider: 'elevenlabs' | 'xtts'
}

interface SettingsState {
  openaiApiKey: string | null
  elevenlabsApiKey: string | null
  pikaApiKey: string | null
  runwayApiKey: string | null
  customVoiceAudio: string | null // Base64 encoded audio or blob URL
  customVoiceName: string | null
  clonedVoices: ClonedVoice[] // Trained voice models
  voiceLanguage: string // Language code: 'en', 'es', 'ja'
  voiceStyle: string // Style: 'neutral', 'calm', 'hype', 'narrator', 'sinister'
}

// Mock cloned voices to showcase the feature
const mockClonedVoices: ClonedVoice[] = [
  {
    voice_id: 'mock-abel-11l',
    name: 'Abel-11L',
    description: 'My trained voice clone (ElevenLabs)',
    type: 'cloud',
    provider: 'elevenlabs',
  },
  {
    voice_id: 'mock-narrator-pro',
    name: 'Narrator Pro',
    description: 'Professional documentary narrator voice',
    type: 'cloud',
    provider: 'elevenlabs',
  },
  {
    voice_id: 'mock-spanish-voice',
    name: 'Spanish Narrator',
    description: 'Trained Spanish voice for multilingual content',
    type: 'cloud',
    provider: 'elevenlabs',
  },
]

const initialState: SettingsState = {
  openaiApiKey: null,
  elevenlabsApiKey: null,
  pikaApiKey: null,
  runwayApiKey: null,
  customVoiceAudio: null,
  customVoiceName: null,
  clonedVoices: mockClonedVoices, // Add mock cloned voices
  voiceLanguage: 'en',
  voiceStyle: 'neutral',
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setOpenAIApiKey: (state, action: PayloadAction<string>) => {
      state.openaiApiKey = action.payload
    },
    setElevenLabsApiKey: (state, action: PayloadAction<string>) => {
      state.elevenlabsApiKey = action.payload
    },
    setPikaApiKey: (state, action: PayloadAction<string>) => {
      state.pikaApiKey = action.payload
    },
    setRunwayApiKey: (state, action: PayloadAction<string>) => {
      state.runwayApiKey = action.payload
    },
    setCustomVoice: (
      state,
      action: PayloadAction<{ audio: string; name: string }>
    ) => {
      state.customVoiceAudio = action.payload.audio
      state.customVoiceName = action.payload.name
    },
    clearCustomVoice: (state) => {
      state.customVoiceAudio = null
      state.customVoiceName = null
    },
    addClonedVoice: (state, action: PayloadAction<ClonedVoice>) => {
      // Check if voice already exists
      const exists = state.clonedVoices.some((v) => v.voice_id === action.payload.voice_id)
      if (!exists) {
        state.clonedVoices.push(action.payload)
      }
    },
    removeClonedVoice: (state, action: PayloadAction<string>) => {
      state.clonedVoices = state.clonedVoices.filter((v) => v.voice_id !== action.payload)
    },
    setClonedVoices: (state, action: PayloadAction<ClonedVoice[]>) => {
      state.clonedVoices = action.payload
    },
    setVoiceLanguage: (state, action: PayloadAction<string>) => {
      state.voiceLanguage = action.payload
    },
    setVoiceStyle: (state, action: PayloadAction<string>) => {
      state.voiceStyle = action.payload
    },
  },
})

export const {
  setOpenAIApiKey,
  setElevenLabsApiKey,
  setPikaApiKey,
  setRunwayApiKey,
  setCustomVoice,
  clearCustomVoice,
  addClonedVoice,
  removeClonedVoice,
  setClonedVoices,
  setVoiceLanguage,
  setVoiceStyle,
} = settingsSlice.actions
export default settingsSlice.reducer

