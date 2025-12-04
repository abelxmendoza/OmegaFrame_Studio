import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { projectId, script, voiceId, engine, language, style } = await req.json()

    if (!projectId || !script) {
      return NextResponse.json(
        { error: 'projectId and script are required' },
        { status: 400 }
      )
    }

    const pythonRenderUrl = process.env.PYTHON_RENDER_URL || 'http://localhost:8000'

    const response = await fetch(`${pythonRenderUrl}/voice/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        script,
        voiceId,
        engine: engine || 'cloud',
        language: language || 'en',
        style: style || 'neutral',
      }),
    })

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating voice:', error)
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    )
  }
}

