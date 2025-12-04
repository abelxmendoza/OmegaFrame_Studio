import type { OFTemplate } from '@/shared/types'

export const DEFAULT_TEMPLATES: OFTemplate[] = [
  {
    id: 'tech-edu-01',
    title: 'Tech & AI Educational Explainer',
    category: 'tech',
    description: 'Perfect for explaining complex tech concepts in simple terms',
    scriptStructure: `[INTRO]
Hook the viewer with a simple question.
Explain what the technology is in one sentence.

[SECTION 1: Simple Definition]
Define the concept in plain English.
Add an example or analogy.

[SECTION 2: Why It Matters]
Explain the real-world impact.

[SECTION 3: How It Works]
Break into 3 simple steps.

[CONCLUSION]
Summarize the key idea.
Invite curiosity for the next topic.`,
    sceneStructure: [
      {
        title: 'Hook',
        description: 'A clean futuristic lab environment illustrating the concept visually.',
        prompt: 'AI futuristic hologram interface, glowing diagrams, cyber tech visuals',
      },
      {
        title: 'Simple Definition',
        description: 'A visual breakdown of the concept using simple icons and animations.',
        prompt: 'digital icons, concept diagram, neon blue tech design',
      },
      {
        title: 'How It Works',
        description: 'Three-step animation of the technology in action.',
        prompt: 'diagrammatic sequence, step-by-step animation, purple/blue glow',
      },
      {
        title: 'Real-World Impact',
        description: 'Show real-world examples where the tech is used.',
        prompt: 'AI robots in factories, smart cities, neural networks visualization',
      },
    ],
    defaultVoice: 'tech_narrator_male',
    defaultLength: 'medium',
    thumbnailPrompt: 'cinematic cyberpunk purple glow, futuristic tech, bold focal point, dramatic lighting, no text, 16:9 composition',
  },
  {
    id: 'finance-edu-01',
    title: 'Finance Education Explainer',
    category: 'finance',
    description: 'Break down financial concepts for easy understanding',
    scriptStructure: `[INTRO]
State the financial concept.
Hook with a relatable question.

[SECTION 1: What It Means]
Define the financial concept in simple terms.

[SECTION 2: Why It's Important]
Explain the real-life impact.

[SECTION 3: Example]
Walk through a real example (numbers optional).

[CONCLUSION]
Give actionable advice or a key takeaway.`,
    sceneStructure: [
      {
        title: 'Concept Intro',
        description: 'Clean, modern banking visuals with icons and charts.',
        prompt: 'flat finance icons, modern fintech style, purple and gold palette',
      },
      {
        title: 'Definition',
        description: 'Break down the idea using simple visuals.',
        prompt: 'minimal design, charts, animated numbers',
      },
      {
        title: 'Example',
        description: 'Show step-by-step example.',
        prompt: 'graphical money flow, animated savings icons',
      },
      {
        title: 'Action Steps',
        description: 'Provide takeaway advice.',
        prompt: 'motivational clean design, checklist animation',
      },
    ],
    defaultVoice: 'neutral_female',
    defaultLength: 'medium',
    thumbnailPrompt: 'modern finance graphics, clean design, purple and gold accents, professional, no text, 16:9 composition',
  },
  {
    id: 'news-explain-01',
    title: 'News Breakdown Explainer',
    category: 'news',
    description: 'Explain current events clearly and factually',
    scriptStructure: `[INTRO]
Explain the headline in one sentence.

[WHAT HAPPENED]
Summarize the event factually.

[BACKGROUND]
Explain why this matters historically.

[IMPACT]
Explain how it affects the viewer.

[OUTRO]
Wrap up with a neutral or hopeful perspective.`,
    sceneStructure: [
      {
        title: 'Headline Summary',
        description: 'Bold typography and news-style overlays.',
        prompt: 'modern news graphics, breaking news style, red-blue palette',
      },
      {
        title: 'What Happened',
        description: 'Maps, icons, and simple animation.',
        prompt: 'clean infographic style, map animation, white background',
      },
      {
        title: 'Impact',
        description: 'Show possible outcomes.',
        prompt: 'balanced neutral visuals, flowcharts',
      },
    ],
    defaultVoice: 'news_anchor_male',
    defaultLength: 'short',
    thumbnailPrompt: 'breaking news style, bold graphics, red-blue palette, modern design, no text, 16:9 composition',
  },
  {
    id: 'story-01',
    title: 'Cinematic Storytelling',
    category: 'story',
    description: 'Create engaging narrative videos with dramatic visuals',
    scriptStructure: `[HOOK]
Start with a dramatic or mysterious statement.

[SETUP]
Introduce the world and main character.

[CONFLICT]
Explain the challenge or danger.

[RISING ACTION]
Build tension with sensory detail.

[CLIMAX]
Describe the defining moment.

[RESOLUTION]
Close the loop with emotion or meaning.`,
    sceneStructure: [
      {
        title: 'Hook',
        description: 'Dramatic cinematic shot.',
        prompt: 'dark cyberpunk neon rain, high contrast',
      },
      {
        title: 'Setup',
        description: 'World-building visuals.',
        prompt: 'futuristic city, purple accents, foggy neon',
      },
      {
        title: 'Conflict',
        description: 'Tension rise.',
        prompt: 'close-up, intense atmosphere, red lighting',
      },
      {
        title: 'Climax',
        description: 'Defining moment.',
        prompt: 'epic cinematic shot, dramatic lighting, action',
      },
      {
        title: 'Resolution',
        description: 'Emotional closure.',
        prompt: 'calm aftermath, soft lighting, resolution',
      },
    ],
    defaultVoice: 'deep_story_male',
    defaultLength: 'long',
    thumbnailPrompt: 'cinematic cyberpunk purple glow, futuristic tech, bold focal point, dramatic lighting, no text, 16:9 composition',
  },
  {
    id: 'advice-01',
    title: 'Life & Relationship Advice',
    category: 'advice',
    description: 'Helpful guidance with emotional connection',
    scriptStructure: `[PROBLEM]
Describe the emotional struggle.

[WHY IT HAPPENS]
Explain psychology behind it.

[HOW TO FIX IT]
Give simple actionable steps.

[REAL TALK]
Encourage the viewer with confidence.`,
    sceneStructure: [
      {
        title: 'Problem',
        description: 'Soft emotional visuals.',
        prompt: 'film photography style, warm light',
      },
      {
        title: 'Why It Happens',
        description: 'Illustrate human behavior.',
        prompt: 'psychology symbols, mind animation',
      },
      {
        title: 'Solution',
        description: 'Motivational tone.',
        prompt: 'clean minimal gradient, uplifting',
      },
    ],
    defaultVoice: 'calm_female',
    defaultLength: 'short',
    thumbnailPrompt: 'warm emotional photography style, soft lighting, purple accents, human connection, no text, 16:9 composition',
  },
  {
    id: 'commentary-01',
    title: 'Opinion & Commentary',
    category: 'commentary',
    description: 'Share your perspective on trending topics',
    scriptStructure: `[HOOK]
Start with a bold statement or question.

[YOUR TAKE]
Present your unique perspective.

[EVIDENCE]
Support with examples or data.

[COUNTER-ARGUMENT]
Acknowledge other viewpoints.

[CONCLUSION]
Reinforce your main point.`,
    sceneStructure: [
      {
        title: 'Hook',
        description: 'Bold, attention-grabbing visuals.',
        prompt: 'dynamic typography, bold colors, modern design',
      },
      {
        title: 'Your Take',
        description: 'Supporting visuals for your argument.',
        prompt: 'infographic style, data visualization',
      },
      {
        title: 'Conclusion',
        description: 'Strong closing statement.',
        prompt: 'powerful imagery, confident tone',
      },
    ],
    defaultVoice: 'neutral_male',
    defaultLength: 'medium',
    thumbnailPrompt: 'bold typography style, dynamic colors, modern design, opinionated feel, no text, 16:9 composition',
  },
  {
    id: 'documentary-01',
    title: 'Documentary Style',
    category: 'documentary',
    description: 'In-depth exploration of real-world topics',
    scriptStructure: `[INTRO]
Introduce the topic and why it matters.

[HISTORICAL CONTEXT]
Provide background information.

[PRESENT STATE]
Explain current situation.

[ANALYSIS]
Deep dive into key aspects.

[CONCLUSION]
Summarize insights and implications.`,
    sceneStructure: [
      {
        title: 'Intro',
        description: 'Establishing shots and context.',
        prompt: 'documentary style, real-world locations, cinematic',
      },
      {
        title: 'Historical Context',
        description: 'Archive-style visuals.',
        prompt: 'vintage footage style, historical imagery',
      },
      {
        title: 'Present State',
        description: 'Current reality visuals.',
        prompt: 'modern documentary, real locations, authentic',
      },
      {
        title: 'Analysis',
        description: 'Supporting graphics and data.',
        prompt: 'infographic overlay, data visualization',
      },
    ],
    defaultVoice: 'narrator_male',
    defaultLength: 'long',
    thumbnailPrompt: 'documentary style, cinematic real-world locations, authentic atmosphere, purple accents, no text, 16:9 composition',
  },
  {
    id: 'shorts-01',
    title: 'Quick Shorts Format',
    category: 'shorts',
    description: 'Fast-paced content optimized for short-form platforms',
    scriptStructure: `[HOOK - 3 seconds]
Grab attention immediately.

[MAIN POINT - 10 seconds]
Deliver the core message fast.

[VISUAL PUNCH - 5 seconds]
Show something memorable.

[CTA - 2 seconds]
End with clear call-to-action.`,
    sceneStructure: [
      {
        title: 'Hook',
        description: 'Instant attention grabber.',
        prompt: 'vibrant colors, fast motion, eye-catching',
      },
      {
        title: 'Main Point',
        description: 'Core message delivery.',
        prompt: 'clear visuals, bold text overlay, energetic',
      },
      {
        title: 'Visual Punch',
        description: 'Memorable moment.',
        prompt: 'stunning visual, unexpected, shareable',
      },
    ],
    defaultVoice: 'energetic_male',
    defaultLength: 'short',
    thumbnailPrompt: 'vibrant energetic colors, fast motion feel, eye-catching design, purple accents, no text, 16:9 composition',
  },
]

export function getTemplateById(id: string): OFTemplate | undefined {
  return DEFAULT_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: OFTemplate['category']): OFTemplate[] {
  return DEFAULT_TEMPLATES.filter((t) => t.category === category)
}

export function getAllCategories(): OFTemplate['category'][] {
  return Array.from(new Set(DEFAULT_TEMPLATES.map((t) => t.category)))
}
