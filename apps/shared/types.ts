// OmegaFrame Studio Shared Types

export interface MediaItem {
  id: string
  type: 'video' | 'image' | 'audio'
  url: string
  thumbnail?: string
  metadata?: Record<string, any>
}

export interface OFTemplate {
  id: string
  title: string
  category:
    | 'tech'
    | 'finance'
    | 'news'
    | 'story'
    | 'advice'
    | 'commentary'
    | 'documentary'
    | 'shorts'
  scriptStructure: string
  sceneStructure: Array<{ title: string; description: string; prompt: string }>
  defaultVoice: string
  defaultLength: 'short' | 'medium' | 'long'
  description?: string
  thumbnail?: string
}
