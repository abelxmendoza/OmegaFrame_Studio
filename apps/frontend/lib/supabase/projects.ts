import { supabase } from './client'

export interface ProjectInsert {
  id?: string
  title: string
  description?: string | null
  script?: string | null
  status?: string
  user_id?: string | null
}

export interface ProjectUpdate {
  title?: string
  description?: string | null
  script?: string | null
  status?: string
}

export async function createProject(data: ProjectInsert & { id?: string }) {
  const insertData: any = { ...data }
  if (data.id) {
    insertData.id = data.id
  }
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error
  return project
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function loadProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, scenes(*), clips(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function listProjects(userId?: string | null) {
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
