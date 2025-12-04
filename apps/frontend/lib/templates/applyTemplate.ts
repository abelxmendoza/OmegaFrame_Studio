import { v4 as uuidv4 } from 'uuid'
import { store } from '@/redux/store'
import { addProject, setScenes, setScript } from '@/redux/projectSlice'
import { generateScript } from '@/lib/api'
import { generateScriptPromptFromTemplate } from '../templateUtils'
import type { OFTemplate } from '@/shared/types'
import { createProject as createProjectDB } from '@/lib/supabase/projects'
import { syncScenes } from '@/lib/supabase/scenes'

// Check if Supabase is enabled
const supabaseEnabled = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function createProjectFromTemplate(template: OFTemplate): Promise<string> {
  const projectId = uuidv4()

  // Generate script from template structure
  let script = template.scriptStructure
  try {
    // Use GPT to expand the template structure into a full script
    const prompt = generateScriptPromptFromTemplate(template, 'Create a video based on this template structure')
    const result = await generateScript(prompt)
    if (result.script) {
      script = result.script
    }
  } catch (error) {
    console.error('Error generating script from template:', error)
    // Fallback to template structure if generation fails
  }

  // Create project in Redux
  store.dispatch(
    addProject({
      id: projectId,
      name: template.title,
      topic: `Created from ${template.title} template`,
      clips: [],
      script: script,
      templateId: template.id,
      voiceId: template.defaultVoice,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  )

  // Create scenes from template
  const scenes = parseScenesFromTemplate(template.sceneStructure, projectId)
  store.dispatch(setScenes({ projectId, scenes }))
  store.dispatch(setScript({ projectId, script }))

  // Create project in Supabase if enabled
  if (supabaseEnabled) {
    try {
      await createProjectDB({
        id: projectId,
        title: template.title,
        description: `Auto-generated using ${template.title} template.`,
        script: script,
        status: 'draft',
      })

      // Sync scenes to Supabase
      await syncScenes(projectId, scenes.map((s) => ({
        project_id: projectId,
        number: s.number,
        title: s.title,
        description: s.description,
        prompt: s.prompt,
      })))
    } catch (error) {
      console.error('Error creating project in Supabase:', error)
      // Continue with Redux-only project
    }
  }

  return projectId
}

export function parseScenesFromTemplate(
  sceneDefs: Array<{ title: string; description: string; prompt: string }>,
  projectId: string
) {
  return sceneDefs.map((scene, index) => ({
    id: uuidv4(),
    project_id: projectId,
    number: index + 1,
    title: scene.title,
    description: scene.description,
    prompt: scene.prompt,
  }))
}
