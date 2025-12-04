import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const pythonRenderUrl = process.env.PYTHON_RENDER_URL || 'http://localhost:8000'

    const response = await fetch(`${pythonRenderUrl}/voice/cloud/list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Python service error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error listing cloned voices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list cloned voices' },
      { status: 500 }
    )
  }
}

