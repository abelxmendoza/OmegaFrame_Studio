import { supabase } from './client'

export interface ClipInsert {
  project_id: string
  scene_id?: string | null
  provider: string
  status?: string
  file_url?: string | null
  thumbnail_url?: string | null
  duration?: number | null
  order_index?: number
  prompt?: string | null
}

export interface ClipUpdate {
  scene_id?: string | null
  provider?: string
  status?: string
  file_url?: string | null
  thumbnail_url?: string | null
  duration?: number | null
  order_index?: number
  prompt?: string | null
}

export async function saveClip(clip: ClipInsert) {
  const { data, error } = await supabase.from('clips').upsert(clip).select().single()
  if (error) throw error
  return data
}

export async function updateClip(id: string, updates: ClipUpdate) {
  const { data, error } = await supabase
    .from('clips')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getClipsByProject(projectId: string) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data
}

export async function getClipsByScene(sceneId: string) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('scene_id', sceneId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data
}

export async function deleteClip(id: string) {
  const { error } = await supabase.from('clips').delete().eq('id', id)
  if (error) throw error
}

export async function reorderClips(projectId: string, clipIds: string[]) {
  // Update order_index for each clip
  const updates = clipIds.map((clipId, index) => ({
    id: clipId,
    order_index: index,
  }))

  for (const update of updates) {
    await supabase
      .from('clips')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
  }
}
