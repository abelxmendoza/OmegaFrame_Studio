import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // In a real app, this would fetch from database
    // For now, return mock status
    const status = {
      projectId,
      script: 'completed' as const,
      voice: 'completed' as const,
      images: 'pending' as const,
      videos: 'pending' as const,
      assembly: 'pending' as const,
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error fetching project status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project status' },
      { status: 500 }
    )
  }
}

