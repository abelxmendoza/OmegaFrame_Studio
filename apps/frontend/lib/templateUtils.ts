import { getTemplateById } from './templates'
import type { OFTemplate } from '@/shared/types'

/**
 * Generate a script prompt from a template and topic.
 */
export function generateScriptPromptFromTemplate(template: OFTemplate, topic: string): string {
  return `${topic}

Use this structure:
${template.scriptStructure}

Format scenes using [SCENE X: Title] followed by description.
Make it engaging and follow the template's style.`
}

/**
 * Apply template structure to a project.
 */
export function applyTemplateToProject(template: OFTemplate, topic: string) {
  return {
    script: template.scriptStructure.replace('[INTRO]', `[INTRO]\n${topic}\n`),
    scenes: template.sceneStructure.map((scene, index) => ({
      id: `scene-${index + 1}`,
      number: index + 1,
      title: scene.title,
      description: scene.description,
      prompt: scene.prompt,
    })),
    voiceId: template.defaultVoice,
  }
}

/**
 * Get template-specific generation prompt.
 */
export function getTemplateGenerationPrompt(templateId: string | undefined, topic: string): string {
  if (!templateId) {
    return `${topic}. Format scenes using [SCENE X: Title] followed by description.`
  }

  const template = getTemplateById(templateId)
  if (!template) {
    return `${topic}. Format scenes using [SCENE X: Title] followed by description.`
  }

  return generateScriptPromptFromTemplate(template, topic)
}
