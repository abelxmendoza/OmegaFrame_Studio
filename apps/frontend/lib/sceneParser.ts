import { Scene } from '@/redux/projectSlice'

/**
 * Parse scenes from script text
 * Looks for patterns like [SCENE 1: Title] or SCENE 1: Title
 */
export function parseScenesFromScript(script: string): Scene[] {
  if (!script) return []

  const scenes: Scene[] = []
  const lines = script.split('\n')
  let sceneNumber = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Match patterns like [SCENE 1: Title] or SCENE 1: Title
    const sceneMatch = line.match(/\[?SCENE\s+(\d+):\s*(.+?)\]?/i)
    if (sceneMatch) {
      const number = parseInt(sceneMatch[1])
      const title = sceneMatch[2].trim()

      // Collect description (next few lines until next scene or empty line)
      let description = ''
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim()
        if (nextLine.match(/\[?SCENE\s+\d+:/i) || (nextLine === '' && description)) {
          break
        }
        if (nextLine) {
          description += (description ? ' ' : '') + nextLine
        }
      }

      scenes.push({
        id: `scene-${number}`,
        number,
        title,
        description: description || title,
      })
      sceneNumber = number + 1
    }
  }

  // If no scenes found, try to extract from numbered list or create from paragraphs
  if (scenes.length === 0) {
    const paragraphs = script
      .split('\n\n')
      .filter((p) => p.trim().length > 20)
      .slice(0, 10) // Max 10 scenes

    paragraphs.forEach((para, idx) => {
      const firstLine = para.split('\n')[0].trim()
      const rest = para.split('\n').slice(1).join(' ').trim()

      scenes.push({
        id: `scene-${idx + 1}`,
        number: idx + 1,
        title: firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine,
        description: rest || firstLine,
      })
    })
  }

  return scenes
}

/**
 * Generate video prompt from scene description
 */
export function generatePromptFromScene(scene: Scene): string {
  if (scene.prompt) return scene.prompt

  // Try to extract visual elements from description
  const description = scene.description.toLowerCase()

  // Add cinematic keywords based on content
  let prompt = scene.description

  // Enhance with cinematic terms if not present
  if (!description.includes('cinematic') && !description.includes('shot')) {
    prompt = `Cinematic ${prompt}`
  }

  return prompt
}

