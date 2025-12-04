'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setCustomVoice, clearCustomVoice, addClonedVoice } from '@/redux/settingsSlice'
import { cloneVoice } from '@/lib/api'

export default function VoiceRecorder() {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [voiceName, setVoiceName] = useState('')
  const [showTrainForm, setShowTrainForm] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    // Load saved custom voice
    if (settings.customVoiceAudio) {
      setRecordedAudio(settings.customVoiceAudio)
    }
  }, [settings.customVoiceAudio])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        audioBlobRef.current = audioBlob
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64Audio = reader.result as string
          setRecordedAudio(base64Audio)
          dispatch(
            setCustomVoice({
              audio: base64Audio,
              name: 'Your Voice',
            })
          )
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleDelete = () => {
    if (confirm('Delete your recorded voice?')) {
      setRecordedAudio(null)
      dispatch(clearCustomVoice())
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTrainVoice = async () => {
    if (!audioBlobRef.current || !voiceName.trim()) {
      alert('Please record a voice first and enter a name')
      return
    }

    setIsTraining(true)
    try {
      // Convert blob to File
      const audioFile = new File([audioBlobRef.current], 'voice_sample.wav', {
        type: 'audio/wav',
      })

      const result = await cloneVoice(audioFile, voiceName.trim())

      if (result.error) {
        throw new Error(result.error)
      }

      // Store cloned voice in Redux
      dispatch(
        addClonedVoice({
          voice_id: result.voice_id,
          name: result.name,
          description: result.description || '',
          type: 'cloud',
          provider: 'elevenlabs',
        })
      )

      alert(`Voice "${voiceName}" trained successfully! It's now available in the voice picker.`)
      setShowTrainForm(false)
      setVoiceName('')
    } catch (error: any) {
      console.error('Error training voice:', error)
      alert(`Failed to train voice: ${error.message || 'Unknown error'}`)
    } finally {
      setIsTraining(false)
    }
  }

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-omega-text mb-2">Your Own Voice</h3>
        <p className="text-sm text-omega-text/60">
          Record your voice and train it into an AI voice model. Once trained, it will be available
          in the voice picker for all your projects. Uses ElevenLabs cloud voice cloning (fast & high quality).
        </p>
      </div>

      {recordedAudio ? (
        <div className="space-y-4">
          <div className="bg-omega-bg border border-omega-border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-omega-text">
                  {settings.customVoiceName || 'Your Voice'}
                </div>
                <div className="text-xs text-omega-text/60 mt-1">Recorded voice ready to use</div>
              </div>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
            <audio controls src={recordedAudio} className="w-full" />
          </div>

          {/* Train Voice Section */}
          {!showTrainForm ? (
            <button
              onClick={() => setShowTrainForm(true)}
              className="w-full bg-omega-accent hover:bg-omega-accent/90 px-4 py-3 rounded-md text-white text-sm font-semibold transition-all shadow-omega-glow"
            >
              🚀 Train AI Voice Model (ElevenLabs)
            </button>
          ) : (
            <div className="bg-omega-bg border border-omega-accent/30 rounded-md p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-omega-text/80 mb-2">
                  Voice Name
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., Abel-11L, My Voice, Narrator"
                  className="w-full bg-omega-panel border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                />
                <p className="text-xs text-omega-text/50 mt-1">
                  This will train an AI voice model using ElevenLabs. Takes 1-2 minutes.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTrainVoice}
                  disabled={isTraining || !voiceName.trim()}
                  className="flex-1 bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {isTraining ? 'Training...' : 'Train Voice'}
                </button>
                <button
                  onClick={() => {
                    setShowTrainForm(false)
                    setVoiceName('')
                  }}
                  className="px-4 py-2 bg-omega-panel border border-omega-border hover:border-omega-accent/50 rounded-md text-omega-text text-sm font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              handleDelete()
              startRecording()
            }}
            className="w-full bg-omega-panel border border-omega-border hover:border-omega-accent/50 px-4 py-2 rounded-md text-omega-text text-sm font-medium transition-all"
          >
            Record New Voice
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isRecording ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-md p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-bold text-red-400">Recording...</span>
              </div>
              <div className="text-2xl font-mono text-omega-text mb-4">
                {formatTime(recordingTime)}
              </div>
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-md text-white font-semibold transition-all"
              >
                Stop Recording
              </button>
              <p className="text-xs text-omega-text/60 mt-3">
                Speak clearly into your microphone. Record at least 10-30 seconds for best results.
              </p>
            </div>
          ) : (
            <div className="bg-omega-bg border border-omega-border rounded-md p-6 text-center">
              <div className="text-4xl mb-4">🎤</div>
              <p className="text-omega-text/60 mb-4">
                Click the button below to start recording your voice
              </p>
              <button
                onClick={startRecording}
                className="bg-omega-accent hover:bg-omega-accent/90 px-6 py-3 rounded-md text-white font-semibold transition-all shadow-omega-glow"
              >
                Start Recording
              </button>
              <p className="text-xs text-omega-text/50 mt-4">
                You'll need to allow microphone access. Record 10-30 seconds of clear speech.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

