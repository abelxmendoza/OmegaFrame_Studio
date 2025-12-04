import { retryWithBackoff, categorizeError, logError } from './retry'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// Helper to handle API responses with error checking
async function handleApiResponse<T>(response: Response, context: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = {
      status: response.status,
      statusText: response.statusText,
      ...errorData,
    }
    logError(context, error)
    throw error
  }
  return response.json()
}

export async function generateScript(topic: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      return handleApiResponse(res, 'generateScript')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function generateClip(id: string, prompt: string, provider: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, prompt, provider }),
      })
      return handleApiResponse(res, 'generateClip')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function generateVoice({
  projectId,
  script,
  voiceId,
  engine = 'cloud',
  language = 'en',
  style = 'neutral',
}: {
  projectId: string
  script: string
  voiceId?: string
  engine?: 'cloud' | 'local'
  language?: string
  style?: string
}) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          script,
          voiceId,
          engine,
          language,
          style,
        }),
      })
      return handleApiResponse(res, 'generateVoice')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function assembleVideo(
  id: string,
  clips?: Array<{ path: string; start: number; end: number }>
) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, clips }),
      })
      return handleApiResponse(res, 'assembleVideo')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function editSceneWithAI(scene: any, userRequest: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/scene-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene, userRequest }),
      })
      return handleApiResponse(res, 'editSceneWithAI')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function cloneVoice(audioFile: File, voiceName: string, description?: string) {
  const result = await retryWithBackoff(
    async () => {
      const formData = new FormData()
      formData.append('audio', audioFile)
      formData.append('voice_name', voiceName)
      if (description) formData.append('description', description)

      const res = await fetch(`${API_BASE}/api/voice/clone`, {
        method: 'POST',
        body: formData,
      })
      return handleApiResponse(res, 'cloneVoice')
    },
    {
      maxAttempts: 2, // Fewer retries for file uploads
      initialDelay: 2000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function listClonedVoices() {
  const res = await fetch(`${API_BASE}/api/voice/list`, {
    method: 'GET',
  })
  return res.json()
}

export async function checkVideoStatus(jobId: string, provider: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/generate/video/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, provider }),
      })
      return handleApiResponse(res, 'checkVideoStatus')
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function generateThumbnail(projectId: string, script: string, templateId?: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/thumbnail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, script, templateId }),
      })
      return handleApiResponse(res, 'generateThumbnail')
    },
    {
      maxAttempts: 2, // Fewer retries for image generation
      initialDelay: 2000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

export async function generateSEO(projectId: string, script: string, operation: string) {
  const result = await retryWithBackoff(
    async () => {
      const res = await fetch(`${API_BASE}/api/seo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, script, operation }),
      })
      return handleApiResponse(res, 'generateSEO')
    },
    {
      maxAttempts: 2, // Fewer retries for SEO generation
      initialDelay: 2000,
    }
  )

  if (!result.success) {
    const errorInfo = categorizeError(result.error)
    throw {
      ...result.error,
      userMessage: errorInfo.message,
      retryable: errorInfo.retryable,
    }
  }

  return result.data
}

