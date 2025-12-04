import { configureStore } from '@reduxjs/toolkit'
import projectReducer from './projectSlice'
import generationReducer from './generationSlice'
import settingsReducer from './settingsSlice'
import timelineReducer from './timelineSlice'
import jobReducer from './jobSlice'

export const store = configureStore({
  reducer: {
    project: projectReducer,
    generation: generationReducer,
    settings: settingsReducer,
    timeline: timelineReducer,
    jobs: jobReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

