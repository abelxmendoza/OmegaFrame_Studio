import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const voiceName = formData.get('voice_name') as string
    const description = (formData.get('description') as string) || ''

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    if (!voiceName) {
      return NextResponse.json(
        { error: 'Voice name is required' },
        { status: 400 }
      )
    }

    const pythonRenderUrl = process.env.PYTHON_RENDER_URL || 'http://localhost:8000'

    // Forward the form data to Python backend
    const formDataToSend = new FormData()
    formDataToSend.append('file', audioFile, audioFile.name)
    formDataToSend.append('voice_name', voiceName)
    if (description) {
      formDataToSend.append('description', description)
    }

    const response = await fetch(`${pythonRenderUrl}/voice/cloud/clone`, {
      method: 'POST',
      body: formDataToSend,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Python service error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error cloning voice:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to clone voice' },
      { status: 500 }
    )
  }
}

