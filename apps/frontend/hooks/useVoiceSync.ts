'use client'

import { useCallback } from 'react'
import { saveVoice, getVoicesByUser } from '@/lib/supabase/voices'

interface UseVoiceSyncOptions {
  userId?: string | null
  enabled?: boolean
}

export function useVoiceSync({ userId, enabled = true }: UseVoiceSyncOptions) {
  const saveVoiceToDB = useCallback(
    async (voice: {
      provider: string
      voice_name: string
      voice_id: string
      metadata?: Record<string, any>
    }) => {
      if (!enabled) return

      try {
        await saveVoice({
          user_id: userId || null,
          provider: voice.provider,
          voice_name: voice.voice_name,
          voice_id: voice.voice_id,
          metadata: voice.metadata || {},
        })
      } catch (error) {
        console.error('Error saving voice to DB:', error)
      }
    },
    [userId, enabled]
  )

  const loadVoices = useCallback(async () => {
    if (!enabled) return []

    try {
      return await getVoicesByUser(userId)
    } catch (error) {
      console.error('Error loading voices from DB:', error)
      return []
    }
  }, [userId, enabled])

  return {
    saveVoiceToDB,
    loadVoices,
  }
}
