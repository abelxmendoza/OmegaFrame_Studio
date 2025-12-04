export const SUPPORTED_LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'ja', label: 'Japanese' },
]

export const VOICE_STYLES = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'calm', label: 'Calm' },
  { id: 'hype', label: 'Hype / Energetic' },
  { id: 'narrator', label: 'Narrator' },
  { id: 'sinister', label: 'Sinister' },
]

export type LanguageCode = 'en' | 'es' | 'ja'
export type VoiceStyle = 'neutral' | 'calm' | 'hype' | 'narrator' | 'sinister'

