export interface Project {
  id: string
  title: string
  description: string | null
  script: string | null
  status: string
  user_id?: string | null
  created_at?: string
  updated_at?: string
  scenes?: Scene[]
  clips?: Clip[]
}

export interface Scene {
  id: string
  project_id: string
  number: number
  title: string | null
  description: string | null
  prompt: string | null
  created_at?: string
}

export interface Clip {
  id: string
  project_id: string
  scene_id: string | null
  provider: string
  file_url: string | null
  thumbnail_url: string | null
  status: string
  order_index: number | null
  duration: number | null
  prompt?: string | null
  created_at?: string
}

export interface Voice {
  id: string
  user_id?: string | null
  provider: string
  voice_name: string
  voice_id: string
  metadata: Record<string, any> | null
  created_at?: string
}

export interface Export {
  id: string
  project_id: string
  file_url: string
  thumbnail_url: string | null
  duration: number | null
  resolution: string | null
  created_at?: string
}
