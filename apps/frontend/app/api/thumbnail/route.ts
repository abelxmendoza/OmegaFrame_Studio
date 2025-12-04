import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { buildThumbnailPrompt } from '@/lib/thumbnails/buildPrompt'
import { getTemplateById } from '@/lib/templates'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

export async function POST(req: NextRequest) {
  try {
    const { projectId, script, templateId } = await req.json()

    if (!projectId || !script) {
      return NextResponse.json(
        { error: 'projectId and script are required' },
        { status: 400 }
      )
    }

    // Get template if provided
    const template = templateId ? getTemplateById(templateId) : null

    // Build thumbnail prompt
    const prompt = buildThumbnailPrompt(template, script)

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Generate thumbnail via DALL-E 3
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024', // DALL-E 3 supports 1024x1024, 1792x1024, 1024x1792
      quality: 'standard',
      n: 1,
    })

    const imageUrl = imageResponse.data[0]?.url

    if (!imageUrl) {
      throw new Error('Failed to generate thumbnail image')
    }

    // Download the image
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) {
      throw new Error('Failed to download generated image')
    }

    const imageBuffer = await imageRes.arrayBuffer()
    const imageBytes = Buffer.from(imageBuffer)

    // Upload to Supabase Storage if configured
    if (supabase) {
      try {
        const fileName = `${projectId}.png`
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(fileName, imageBytes, {
            contentType: 'image/png',
            upsert: true,
          })

        if (uploadError) {
          console.error('Supabase upload error:', uploadError)
          // Fall through to return image URL directly
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(fileName)

          const publicUrl = urlData.publicUrl

          // Save URL in database
          const { error: dbError } = await supabase
            .from('projects')
            .update({ thumbnail_url: publicUrl })
            .eq('id', projectId)

          if (dbError) {
            console.error('Database update error:', dbError)
          }

          return NextResponse.json({ url: publicUrl })
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError)
        // Fall through to return image URL directly
      }
    }

    // Fallback: return the OpenAI image URL directly
    return NextResponse.json({ url: imageUrl })
  } catch (error: any) {
    console.error('Thumbnail API error:', error)
    return NextResponse.json(
      { error: error.message || 'Thumbnail generation failed' },
      { status: 500 }
    )
  }
}

