import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface Scene {
  id: string
  number: number
  title: string
  description: string
  prompt?: string
}

export interface Clip {
  id: string
  path: string
  prompt: string
  provider: string
  sceneId?: string
  sceneNumber?: number
  start: number       // trim start in seconds
  end: number         // trim end in seconds
  duration: number    // actual file duration
  url?: string        // optional URL if path is not available
  thumbnail?: string  // optional thumbnail URL
  jobId?: string      // job ID for polling (when status is processing)
  generationStatus?: 'processing' | 'completed' | 'failed' | 'error' | 'timeout' // generation status
}

interface Project {
  id: string
  name: string
  clips: Clip[]
  script: string
  scenes?: Scene[]
  topic?: string
  voiceId?: string
  status?: string
  videoUrl?: string
  thumbnail?: string
  createdAt?: string
  updatedAt?: string
  templateId?: string
}

interface ProjectState {
  projects: Record<string, Project>
}

// Mock data to make it look like the app has been used
const mockProjects: Record<string, Project> = {
  'proj-1': {
    id: 'proj-1',
    name: 'Cyberpunk Streets Montage',
    topic: 'A cinematic journey through neon-lit cyberpunk streets at night',
    voiceId: 'mock-abel-11l', // Using cloned voice
    script: `INT. DARK CITY – NIGHT

Neon lights flicker against rain-soaked streets. The city never sleeps.

[SCENE 1: Wide shot of cityscape]
The camera pans across a sprawling metropolis, where holographic advertisements dance in the air.

[SCENE 2: Street level]
We follow a figure walking through narrow alleys, reflections of neon signs shimmering in puddles.

[SCENE 3: Close-up]
Raindrops hit the lens. The city's pulse is electric, alive, dangerous.

FADE OUT.`,
    clips: [
      {
        id: 'clip-1',
        path: '/mock/clip1.mp4',
        prompt: 'Cyberpunk alley at night, neon lights reflecting on wet streets',
        provider: 'pika',
        start: 0,
        end: 5,
        duration: 5,
      },
      {
        id: 'clip-2',
        path: '/mock/clip2.mp4',
        prompt: 'Wide shot of futuristic cityscape with holographic advertisements',
        provider: 'runway',
        start: 0,
        end: 5,
        duration: 5,
      },
      {
        id: 'clip-3',
        path: '/mock/clip3.mp4',
        prompt: 'Close-up of raindrops on camera lens, neon lights in background',
        provider: 'pika',
        start: 0,
        end: 5,
        duration: 5,
      },
    ],
    status: 'completed',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'proj-2': {
    id: 'proj-2',
    name: 'AI Revolution Documentary',
    topic: 'Exploring the impact of artificial intelligence on modern society',
    voiceId: 'mock-narrator-pro', // Using cloned narrator voice
    script: `INT. MODERN OFFICE – DAY

Artificial intelligence is reshaping our world.

[SCENE 1: Introduction]
We begin with a montage of AI in action - from smartphones to autonomous vehicles.

[SCENE 2: Deep dive]
Experts discuss the implications. The future is here, and it's intelligent.

[SCENE 3: Conclusion]
What does this mean for humanity? The journey has just begun.`,
    clips: [
      {
        id: 'clip-4',
        path: '/mock/clip4.mp4',
        prompt: 'Modern office with AI assistants and smart technology',
        provider: 'pika',
        start: 0,
        end: 5,
        duration: 5,
      },
      {
        id: 'clip-5',
        path: '/mock/clip5.mp4',
        prompt: 'Autonomous vehicles navigating city streets',
        provider: 'runway',
        start: 0,
        end: 5,
        duration: 5,
      },
    ],
    status: 'rendering',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  'proj-3': {
    id: 'proj-3',
    name: 'Nature Time-lapse',
    topic: 'Beautiful nature scenes captured in time-lapse',
    script: `EXT. FOREST – VARIOUS TIMES

Nature's beauty unfolds through time.

[SCENE 1: Sunrise]
The forest awakens as golden light filters through the trees.

[SCENE 2: Day]
Life moves in harmony - birds, streams, wind through leaves.

[SCENE 3: Sunset]
Day gives way to night, stars begin to appear.`,
    clips: [],
    status: 'draft',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

const projectSlice = createSlice({
  name: 'project',
  initialState: { projects: mockProjects } as ProjectState,
  reducers: {
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects[action.payload.id] = action.payload
    },
    addClip: (
      state,
      action: PayloadAction<{ projectId: string; clip: Partial<Clip> }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        const clip = action.payload.clip
        // Ensure clip has required fields with defaults
        const newClip: Clip = {
          id: clip.id || uuidv4(),
          path: clip.path || clip.url || '',
          prompt: clip.prompt || '',
          provider: clip.provider || 'pika',
          sceneId: clip.sceneId,
          sceneNumber: clip.sceneNumber,
          start: clip.start ?? 0,
          end: clip.end ?? (clip.duration ?? 5),
          duration: clip.duration ?? 5,
          url: clip.url,
          thumbnail: clip.thumbnail,
        }
        state.projects[action.payload.projectId].clips.push(newClip)
      }
    },
    setScript: (
      state,
      action: PayloadAction<{ projectId: string; script: string }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].script = action.payload.script
      }
    },
    setScenes: (
      state,
      action: PayloadAction<{ projectId: string; scenes: Scene[] }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].scenes = action.payload.scenes
      }
    },
    updateClip: (
      state,
      action: PayloadAction<{ projectId: string; clipIndex: number; clip: any }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        const clips = state.projects[action.payload.projectId].clips
        if (clips[action.payload.clipIndex]) {
          clips[action.payload.clipIndex] = action.payload.clip
        }
      }
    },
    removeClip: (
      state,
      action: PayloadAction<{ projectId: string; clipIndex: number }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        const clips = state.projects[action.payload.projectId].clips
        clips.splice(action.payload.clipIndex, 1)
      }
    },
    updateProjectVoice: (
      state,
      action: PayloadAction<{ projectId: string; voiceId: string }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].voiceId = action.payload.voiceId
      }
    },
    updateProjectName: (
      state,
      action: PayloadAction<{ projectId: string; name: string }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].name = action.payload.name
        state.projects[action.payload.projectId].updatedAt = new Date().toISOString()
      }
    },
    setRenderOutput: (
      state,
      action: PayloadAction<{ projectId: string; videoUrl: string; thumbnail?: string }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].videoUrl = action.payload.videoUrl
        state.projects[action.payload.projectId].thumbnail = action.payload.thumbnail
        state.projects[action.payload.projectId].status = 'completed'
        state.projects[action.payload.projectId].updatedAt = new Date().toISOString()
      }
    },
    reorderClips: (
      state,
      action: PayloadAction<{ projectId: string; newOrder: Clip[] }>
    ) => {
      if (state.projects[action.payload.projectId]) {
        state.projects[action.payload.projectId].clips = action.payload.newOrder
      }
    },
    setClipTrim: (
      state,
      action: PayloadAction<{ projectId: string; clipId: string; start: number; end: number }>
    ) => {
      const project = state.projects[action.payload.projectId]
      if (project) {
        const clip = project.clips.find(c => c.id === action.payload.clipId)
        if (clip) {
          clip.start = action.payload.start
          clip.end = action.payload.end
        }
      }
    },
  },
})

export const {
  addProject,
  addClip,
  setScript,
  setScenes,
  updateClip,
  removeClip,
  updateProjectVoice,
  updateProjectName,
  setRenderOutput,
  reorderClips,
  setClipTrim,
} = projectSlice.actions
export default projectSlice.reducer

