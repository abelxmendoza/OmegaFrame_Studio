import { supabase } from './client'

export interface SceneInsert {
  project_id: string
  number: number
  title?: string | null
  description?: string | null
  prompt?: string | null
}

export async function syncScenes(projectId: string, scenes: SceneInsert[]) {
  // Clear old scenes
  await supabase.from('scenes').delete().eq('project_id', projectId)

  // Insert new scenes
  if (scenes.length > 0) {
    const { error } = await supabase.from('scenes').insert(scenes)
    if (error) throw error
  }
}

export async function createScene(scene: SceneInsert) {
  const { data, error } = await supabase.from('scenes').insert(scene).select().single()
  if (error) throw error
  return data
}

export async function updateScene(id: string, updates: Partial<SceneInsert>) {
  const { data, error } = await supabase
    .from('scenes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteScene(id: string) {
  const { error } = await supabase.from('scenes').delete().eq('id', id)
  if (error) throw error
}

export async function getScenesByProject(projectId: string) {
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('number', { ascending: true })

  if (error) throw error
  return data
}
