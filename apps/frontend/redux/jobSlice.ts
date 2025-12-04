import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Job {
  id: string
  project_id?: string
  type?: 'script' | 'voice' | 'clip' | 'render'
  status: 'queued' | 'running' | 'success' | 'error'
  progress: number
  message?: string
  result?: any
}

interface JobState {
  [jobId: string]: Job
}

const initialState: JobState = {}

export const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    registerJob(state, action: PayloadAction<Job>) {
      const job = action.payload
      state[job.id] = {
        ...job,
        progress: job.progress || 0,
        status: job.status || 'queued',
      }
    },
    updateJob(state, action: PayloadAction<{ id: string; data: Partial<Job> }>) {
      const { id, data } = action.payload
      if (state[id]) {
        state[id] = { ...state[id], ...data }
      }
    },
    removeJob(state, action: PayloadAction<string>) {
      delete state[action.payload]
    },
    clearJobs(state) {
      return {}
    },
  },
})

export const { registerJob, updateJob, removeJob, clearJobs } = jobSlice.actions
export default jobSlice.reducer
