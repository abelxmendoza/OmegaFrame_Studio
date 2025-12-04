import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GenerationState {
  status: 'idle' | 'generating' | 'rendering' | 'completed' | 'error'
  progress: number
}

const generationSlice = createSlice({
  name: 'generation',
  initialState: { status: 'idle', progress: 0 } as GenerationState,
  reducers: {
    setStatus: (state, action: PayloadAction<GenerationState['status']>) => {
      state.status = action.payload
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload
    },
  },
})

export const { setStatus, setProgress } = generationSlice.actions
export default generationSlice.reducer
