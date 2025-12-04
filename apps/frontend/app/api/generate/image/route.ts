import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, provider = 'dalle', projectId } = await req.json()

    if (!prompt || !projectId) {
      return NextResponse.json(
        { error: 'prompt and projectId are required' },
        { status: 400 }
      )
    }

    const pythonRenderUrl = process.env.PYTHON_RENDER_URL || 'http://localhost:8000'

    const response = await fetch(`${pythonRenderUrl}/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider, projectId }),
    })

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}

