import type { OFTemplate } from '@/shared/types'

export function buildThumbnailPrompt(template: OFTemplate | null, script: string): string {
  const defaultStyle = 'cinematic cyberpunk purple glow, futuristic tech, bold focal point, dramatic lighting, no text, 16:9 composition'
  const style = template?.thumbnailPrompt || defaultStyle

  return `Generate a cinematic YouTube thumbnail image.

STYLE:
${style}

VIDEO SUMMARY:
${script.slice(0, 600)}

REQUIREMENTS:
- 1280x720 resolution
- No words or typography
- High contrast
- Center focal subject
- Purple black Omega Technologies cyberpunk aesthetic
- Futuristic, cinematic atmosphere`

