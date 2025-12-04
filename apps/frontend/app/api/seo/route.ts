import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import {
  buildTitlePrompt,
  buildDescriptionPrompt,
  buildTagsPrompt,
  buildHashtagsPrompt,
  buildChapterPrompt,
} from '@/lib/seo/promptBuilders'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { projectId, script, operation } = await req.json()

    if (!projectId || !script || !operation) {
      return NextResponse.json(
        { error: 'projectId, script, and operation are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    let result

    if (operation === 'title') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: buildTitlePrompt(script) }],
      })

      const content = completion.choices[0]?.message?.content || ''
      // Extract titles (remove numbering, bullets, etc.)
      const titles = content
        .split('\n')
        .map(line => line.replace(/^[\d\-•\s]+/, '').trim())
        .filter(line => line.length > 0 && line.length <= 60)
        .slice(0, 6)

      const primaryTitle = titles[0] || 'Untitled Video'

      await supabase
        .from('projects')
        .update({ seo_title: primaryTitle })
        .eq('id', projectId)

      return NextResponse.json({ titles, primaryTitle })
    }

    if (operation === 'chapters') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: buildChapterPrompt(script) }],
      })

      const content = completion.choices[0]?.message?.content || ''
      
      // Try to extract JSON from the response
      let chapters
      try {
        // Remove markdown code blocks if present
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          chapters = JSON.parse(jsonMatch[0])
        } else {
          chapters = JSON.parse(content)
        }
      } catch (e) {
        // Fallback: create simple chapters from script structure
        chapters = [
          { time: '00:00', title: 'Introduction' },
          { time: '01:00', title: 'Main Content' },
          { time: '02:00', title: 'Conclusion' },
        ]
      }

      await supabase
        .from('projects')
        .update({ seo_chapters: chapters })
        .eq('id', projectId)

      return NextResponse.json({ chapters })
    }

    if (operation === 'description') {
      // Get existing chapters for description
      const { data: project } = await supabase
        .from('projects')
        .select('seo_chapters')
        .eq('id', projectId)
        .single()

      const chapters = (project?.seo_chapters as Array<{ time: string; title: string }>) || []

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: buildDescriptionPrompt(script, chapters),
          },
        ],
      })

      const description = completion.choices[0]?.message?.content || ''

      await supabase
        .from('projects')
        .update({ seo_description: description })
        .eq('id', projectId)

      return NextResponse.json({ description })
    }

    if (operation === 'tags') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: buildTagsPrompt(script) }],
      })

      const content = completion.choices[0]?.message?.content || ''
      // Extract tags (comma-separated or line-separated)
      const tags = content
        .split(/[,\n]/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 20)

      await supabase
        .from('projects')
        .update({ seo_tags: tags })
        .eq('id', projectId)

      return NextResponse.json({ tags })
    }

    if (operation === 'hashtags') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: buildHashtagsPrompt(script) }],
      })

      const content = completion.choices[0]?.message?.content || ''
      // Extract hashtags
      const hashtags = content
        .split('\n')
        .map(line => {
          // Extract hashtag if present, otherwise add # prefix
          const match = line.match(/#?\w+/)
          if (match) {
            const tag = match[0].startsWith('#') ? match[0] : `#${match[0]}`
            return tag.trim()
          }
          return null
        })
        .filter((tag): tag is string => tag !== null && tag.length > 1)
        .slice(0, 15)

      await supabase
        .from('projects')
        .update({ seo_hashtags: hashtags })
        .eq('id', projectId)

      return NextResponse.json({ hashtags })
    }

    return NextResponse.json(
      { error: `Unknown operation: ${operation}` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('SEO generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate SEO content' },
      { status: 500 }
    )
  }
}
