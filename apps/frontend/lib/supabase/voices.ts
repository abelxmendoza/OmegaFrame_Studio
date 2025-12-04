import { supabase } from './client'

export interface VoiceInsert {
  user_id?: string | null
  provider: string
  voice_name: string
  voice_id: string
  metadata?: Record<string, any>
}

export async function saveVoice(voice: VoiceInsert) {
  const { data, error } = await supabase.from('voices').upsert(voice).select().single()
  if (error) throw error
  return data
}

export async function getVoicesByUser(userId?: string | null) {
  let query = supabase.from('voices').select('*').order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function deleteVoice(id: string) {
  const { error } = await supabase.from('voices').delete().eq('id', id)
  if (error) throw error
}
