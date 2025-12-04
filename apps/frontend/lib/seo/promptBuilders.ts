/**
 * SEO Prompt Builders for YouTube optimization
 * Generates prompts for GPT to create SEO-optimized content
 */

export function buildTitlePrompt(script: string) {
  return `
Generate 6 YouTube titles optimized for high CTR.

Rules:
- Must be exciting and curiosity-driven.
- Include trending keywords.
- Do NOT exceed 55 characters.

CONTENT TO SUMMARIZE:

${script.slice(0, 2500)}
  `.trim()
}

export function buildDescriptionPrompt(script: string, chapters: Array<{ time: string; title: string }>) {
  const chaptersText = chapters.length > 0
    ? chapters.map(c => `${c.time} — ${c.title}`).join('\n')
    : 'No chapters available yet.'

  return `
Write a YouTube description including:
- A clear summary of the video's topic.
- Key insights from the script.
- SEO keywords.
- This timestamp section:

Chapters:

${chaptersText}

Length: 2–3 paragraphs.
Tone: professional but engaging.

SCRIPT:

${script.slice(0, 2500)}
  `.trim()
}

export function buildTagsPrompt(script: string) {
  return `
Generate 20 SEO tags based on this video script.
Return ONLY a comma-separated list.

SCRIPT:

${script.slice(0, 2000)}
  `.trim()
}

export function buildHashtagsPrompt(script: string) {
  return `
Generate 15 YouTube hashtags based on this script.
Return ONLY hashtags, one per line.
Format: #hashtag1
        #hashtag2
        etc.

SCRIPT:

${script.slice(0, 2000)}
  `.trim()
}

export function buildChapterPrompt(script: string) {
  return `
Extract YouTube chapters from the video script.
Output format must be valid JSON array:

[
  { "time": "00:00", "title": "Intro" },
  { "time": "00:24", "title": "Key Concept" },
  { "time": "01:15", "title": "Conclusion" }
]

Rules:
- Time format: MM:SS or HH:MM:SS
- Start with 00:00 for intro
- Extract main sections from the script
- Keep titles concise (under 50 characters)

SCRIPT:

${script.slice(0, 3000)}
  `.trim()
}
