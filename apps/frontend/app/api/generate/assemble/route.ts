import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { projectId, clips } = await req.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const pythonRenderUrl = process.env.PYTHON_RENDER_URL || 'http://localhost:8000'

    const response = await fetch(`${pythonRenderUrl}/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, clips }),
    })

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error assembling video:', error)
    return NextResponse.json(
      { error: 'Failed to assemble video' },
      { status: 500 }
    )
  }
}

