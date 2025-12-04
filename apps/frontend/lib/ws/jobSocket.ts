import { store } from '@/redux/store'
import { updateJob, registerJob } from '@/redux/jobSlice'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_BASE = API_BASE.replace('http://', 'ws://').replace('https://', 'wss://')

export function connectJobSocket(jobId: string): WebSocket {
  const wsUrl = `${WS_BASE}/ws/job/${jobId}`
  const ws = new WebSocket(wsUrl)

  // Register job on connection
  store.dispatch(
    registerJob({
      id: jobId,
      status: 'queued',
      progress: 0,
    })
  )

  ws.onopen = () => {
    console.log(`✅ WebSocket connected for job ${jobId}`)
    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping')
      } else {
        clearInterval(pingInterval)
      }
    }, 30000) // Ping every 30 seconds
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === 'progress') {
        store.dispatch(
          updateJob({
            id: jobId,
            data: {
              progress: data.progress,
              message: data.message,
              status: 'running',
            },
          })
        )
      }

      if (data.type === 'status') {
        store.dispatch(
          updateJob({
            id: jobId,
            data: {
              status: data.status,
              message: data.message,
            },
          })
        )
      }

      if (data.type === 'complete') {
        store.dispatch(
          updateJob({
            id: jobId,
            data: {
              status: 'success',
              progress: 100,
              message: data.message,
              result: data.result,
            },
          })
        )
      }

      if (data.type === 'error') {
        store.dispatch(
          updateJob({
            id: jobId,
            data: {
              status: 'error',
              message: data.message,
            },
          })
        )
      }

      if (data.type === 'connected') {
        console.log(`📡 Connected to job ${jobId} progress stream`)
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  ws.onerror = (error) => {
    console.error(`WebSocket error for job ${jobId}:`, error)
    store.dispatch(
      updateJob({
        id: jobId,
        data: {
          status: 'error',
          message: 'Connection error',
        },
      })
    )
  }

  ws.onclose = () => {
    console.log(`🔌 WebSocket closed for job ${jobId}`)
  }

  return ws
}
