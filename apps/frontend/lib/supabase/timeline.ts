import { supabase } from './client'

export async function saveTimelineOrder(projectId: string, clips: Array<{ id: string; order_index: number }>) {
  const updates = clips.map((c) => ({
    id: c.id,
    order_index: c.order_index,
  }))

  // Update all clips in a batch
  const promises = updates.map((update) =>
    supabase
      .from('clips')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
  )

  const results = await Promise.all(promises)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    throw new Error(`Failed to save timeline order: ${errors[0].error?.message}`)
  }
}

export async function saveClipTrim(id: string, start: number, end: number) {
  const { error } = await supabase
    .from('clips')
    .update({ start_trim: start, end_trim: end })
    .eq('id', id)

  if (error) throw error
}

export async function loadTimeline(projectId: string) {
  const { data, error } = await supabase
    .from('clips')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) throw error

  // Transform DB clips to timeline format
  return (data || []).map((clip) => ({
    id: clip.id,
    order_index: clip.order_index || 0,
    start: clip.start_trim || 0,
    end: clip.end_trim || clip.duration || 5,
    duration: clip.duration || 5,
    file_url: clip.file_url || '',
    scene_id: clip.scene_id,
    thumbnail_url: clip.thumbnail_url,
    prompt: clip.prompt,
    provider: clip.provider,
  }))
}
