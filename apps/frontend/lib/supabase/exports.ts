import { supabase } from './client'

export interface ExportInsert {
  project_id: string
  file_url: string
  thumbnail_url?: string | null
  resolution?: string | null
  duration?: number | null
}

export async function saveExport(exportData: ExportInsert) {
  const { data, error } = await supabase.from('exports').insert(exportData).select().single()
  if (error) throw error
  return data
}

export async function getExportsByProject(projectId: string) {
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getLatestExport(projectId: string) {
  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}
