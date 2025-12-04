import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, topic } = await req.json()

    if (!name || !topic) {
      return NextResponse.json(
        { error: 'name and topic are required' },
        { status: 400 }
      )
    }

    // In a real app, this would save to a database
    // For now, we'll just return a mock project
    const project = {
      id: `project_${Date.now()}`,
      name,
      topic,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

