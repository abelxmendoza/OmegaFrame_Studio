import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { scene, userRequest } = await req.json()

    if (!scene || !userRequest) {
      return NextResponse.json(
        { error: 'scene and userRequest are required' },
        { status: 400 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `You are an AI assistant that helps edit video scenes. You will receive a scene object with:
- title: The scene title
- description: The scene description
- prompt: The video generation prompt (optional)

The user will give you instructions on how to edit the scene. You should return a JSON object with the updated scene fields (title, description, prompt).

Examples of user requests:
- "Make it more dramatic"
- "Add more detail about the lighting"
- "Change the title to 'Sunset Chase'"
- "Make the description shorter"
- "Update the prompt to include rain effects"

Return ONLY a valid JSON object with this structure:
{
  "title": "updated title",
  "description": "updated description",
  "prompt": "updated prompt"
}

If the user doesn't mention a field, keep it the same. Only modify what the user asks for.`

    const userMessage = `Current scene:
Title: ${scene.title}
Description: ${scene.description}
Prompt: ${scene.prompt || 'Not set'}

User request: ${userRequest}

Return the updated scene as JSON.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate scene edit' },
        { status: 500 }
      )
    }

    try {
      const updatedScene = JSON.parse(response)
      return NextResponse.json({ scene: updatedScene })
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const updatedScene = JSON.parse(jsonMatch[0])
        return NextResponse.json({ scene: updatedScene })
      }
      throw new Error('Invalid JSON response from AI')
    }
  } catch (error) {
    console.error('Error editing scene with AI:', error)
    return NextResponse.json(
      { error: 'Failed to edit scene' },
      { status: 500 }
    )
  }
}

