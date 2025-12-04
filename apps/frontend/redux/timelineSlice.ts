import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface TimelineClip {
  id: string
  order_index: number
  start: number
  end: number
  duration: number
  file_url: string
  scene_id?: string | null
  thumbnail_url?: string | null
  prompt?: string | null
  provider?: string
}

interface TimelineState {
  clips: TimelineClip[]
  selectedClipId: string | null
  scrubTime: number
  totalDuration: number
}

const initialState: TimelineState = {
  clips: [],
  selectedClipId: null,
  scrubTime: 0,
  totalDuration: 0,
}

export const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setTimeline(state, action: PayloadAction<TimelineClip[]>) {
      state.clips = action.payload.sort((a, b) => a.order_index - b.order_index)
      state.totalDuration = state.clips.reduce(
        (sum, clip) => sum + (clip.end - clip.start),
        0
      )
    },
    reorderClips(state, action: PayloadAction<{ id: string; newIndex: number }>) {
      const { id, newIndex } = action.payload
      const clip = state.clips.find((c) => c.id === id)
      if (!clip) return

      const filtered = state.clips.filter((c) => c.id !== id)
      filtered.splice(newIndex, 0, clip)
      state.clips = filtered.map((c, i) => ({ ...c, order_index: i }))
      state.totalDuration = state.clips.reduce(
        (sum, clip) => sum + (clip.end - clip.start),
        0
      )
    },
    trimClip(
      state,
      action: PayloadAction<{ id: string; start: number; end: number }>
    ) {
      const clip = state.clips.find((c) => c.id === action.payload.id)
      if (!clip) return
      clip.start = action.payload.start
      clip.end = action.payload.end
      state.totalDuration = state.clips.reduce(
        (sum, clip) => sum + (clip.end - clip.start),
        0
      )
    },
    setScrubTime(state, action: PayloadAction<number>) {
      state.scrubTime = action.payload
    },
    selectClip(state, action: PayloadAction<string | null>) {
      state.selectedClipId = action.payload
    },
    addClipToTimeline(state, action: PayloadAction<TimelineClip>) {
      const newClip = {
        ...action.payload,
        order_index: state.clips.length,
      }
      state.clips.push(newClip)
      state.clips.sort((a, b) => a.order_index - b.order_index)
      state.totalDuration = state.clips.reduce(
        (sum, clip) => sum + (clip.end - clip.start),
        0
      )
    },
    removeClipFromTimeline(state, action: PayloadAction<string>) {
      state.clips = state.clips
        .filter((c) => c.id !== action.payload)
        .map((c, i) => ({ ...c, order_index: i }))
      state.totalDuration = state.clips.reduce(
        (sum, clip) => sum + (clip.end - clip.start),
        0
      )
      if (state.selectedClipId === action.payload) {
        state.selectedClipId = null
      }
    },
  },
})

export const {
  setTimeline,
  reorderClips,
  trimClip,
  setScrubTime,
  selectClip,
  addClipToTimeline,
  removeClipFromTimeline,
} = timelineSlice.actions

export default timelineSlice.reducer
