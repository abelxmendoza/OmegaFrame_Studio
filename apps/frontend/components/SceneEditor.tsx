'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { Scene, setScenes } from '@/redux/projectSlice'
import { parseScenesFromScript } from '@/lib/sceneParser'
import { editSceneWithAI } from '@/lib/api'

interface SceneEditorProps {
  projectId: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function SceneEditor({ projectId }: SceneEditorProps) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const [scenes, setLocalScenes] = useState<Scene[]>(project?.scenes || [])
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (project?.scenes) {
      setLocalScenes(project.scenes)
    } else if (project?.script) {
      // Auto-generate if not present
      const parsed = parseScenesFromScript(project.script)
      if (parsed.length > 0) {
        setLocalScenes(parsed)
        dispatch(setScenes({ projectId, scenes: parsed }))
      }
    }
  }, [project?.scenes, project?.script, projectId, dispatch])

  useEffect(() => {
    // Initialize chat messages for each scene
    if (scenes.length > 0) {
      const initialMessages: Record<string, ChatMessage[]> = {}
      scenes.forEach((scene) => {
        if (!chatMessages[scene.id]) {
          initialMessages[scene.id] = [
            {
              role: 'assistant',
              content: `I'm your AI assistant for editing Scene ${scene.number}: "${scene.title}". Tell me how you'd like to modify this scene - I can update the title, description, or video prompt. For example, you could say "make it more dramatic" or "add more detail about the lighting".`,
              timestamp: new Date(),
            },
          ]
        }
      })
      if (Object.keys(initialMessages).length > 0) {
        setChatMessages({ ...chatMessages, ...initialMessages })
      }
    }
  }, [scenes])

  useEffect(() => {
    // Scroll to bottom of chat when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, editingSceneId])

  const handleSceneClick = (scene: Scene) => {
    if (editingSceneId === scene.id) {
      // Close if already open
      setEditingSceneId(null)
    } else {
      // Open chat for this scene
      setEditingSceneId(scene.id)
      // Initialize chat if it doesn't exist
      if (!chatMessages[scene.id]) {
        setChatMessages({
          ...chatMessages,
          [scene.id]: [
            {
              role: 'assistant',
              content: `I'm your AI assistant for editing Scene ${scene.number}: "${scene.title}". Tell me how you'd like to modify this scene - I can update the title, description, or video prompt. For example, you could say "make it more dramatic" or "add more detail about the lighting".`,
              timestamp: new Date(),
            },
          ],
        })
      }
    }
  }

  const handleSendMessage = async (sceneIndex: number) => {
    if (!currentMessage.trim() || isLoading) return

    const scene = scenes[sceneIndex]
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    }

    // Add user message to chat
    const updatedMessages = {
      ...chatMessages,
      [scene.id]: [...(chatMessages[scene.id] || []), userMessage],
    }
    setChatMessages(updatedMessages)
    setCurrentMessage('')
    setIsLoading(true)

    try {
      // Call AI to edit scene
      const result = await editSceneWithAI(scene, currentMessage)
      const updatedScene = result.scene

      // Update the scene
      const updatedScenes = [...scenes]
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        title: updatedScene.title || updatedScenes[sceneIndex].title,
        description: updatedScene.description || updatedScenes[sceneIndex].description,
        prompt: updatedScene.prompt !== undefined ? updatedScene.prompt : updatedScenes[sceneIndex].prompt,
      }
      setLocalScenes(updatedScenes)
      dispatch(setScenes({ projectId, scenes: updatedScenes }))

      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `I've updated the scene based on your request. The scene has been modified. Is there anything else you'd like to change?`,
        timestamp: new Date(),
      }
      setChatMessages({
        ...updatedMessages,
        [scene.id]: [...updatedMessages[scene.id], assistantMessage],
      })
    } catch (error) {
      console.error('Error editing scene:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while editing the scene. Please try again.',
        timestamp: new Date(),
      }
      setChatMessages({
        ...updatedMessages,
        [scene.id]: [...updatedMessages[scene.id], errorMessage],
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      number: scenes.length + 1,
      title: `Scene ${scenes.length + 1}`,
      description: '',
    }
    const updated = [...scenes, newScene]
    setLocalScenes(updated)
    dispatch(setScenes({ projectId, scenes: updated }))
    // Auto-open chat for new scene
    setEditingSceneId(newScene.id)
    setChatMessages({
      ...chatMessages,
      [newScene.id]: [
        {
          role: 'assistant',
          content: `I'm your AI assistant for editing Scene ${newScene.number}: "${newScene.title}". Tell me how you'd like to modify this scene - I can update the title, description, or video prompt.`,
          timestamp: new Date(),
        },
      ],
    })
  }

  const handleRemoveScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index)
    // Renumber scenes
    updated.forEach((scene, i) => {
      scene.number = i + 1
    })
    setLocalScenes(updated)
    dispatch(setScenes({ projectId, scenes: updated }))
    if (editingSceneId === scenes[index].id) {
      setEditingSceneId(null)
    }
  }

  const handleRegenerateFromScript = () => {
    if (project?.script) {
      const parsed = parseScenesFromScript(project.script)
      if (parsed.length > 0) {
        setLocalScenes(parsed)
        dispatch(setScenes({ projectId, scenes: parsed }))
        setEditingSceneId(null)
        setChatMessages({})
      }
    }
  }

  if (!project) return null

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-omega-text">AI Scene Editor</h3>
            <span className="text-xs text-omega-text/40 bg-omega-accent/20 text-omega-accent px-2 py-0.5 rounded">
              AI-Powered
            </span>
          </div>
          <p className="text-xs text-omega-text/60 mt-1">
            Click on any scene to open an AI chat. Tell the AI how you want to edit the scene using natural language. 
            For example: "make it more dramatic" or "add rain effects to the prompt".
          </p>
        </div>
        <div className="flex gap-2">
          {project.script && (
            <button
              onClick={handleRegenerateFromScript}
              className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 px-3 py-1.5 rounded-md text-omega-text text-xs font-medium transition-all"
            >
              ↻ Regenerate from Script
            </button>
          )}
          <button
            onClick={handleAddScene}
            className="bg-omega-accent hover:bg-omega-accent/90 px-3 py-1.5 rounded-md text-white text-xs font-semibold transition-all"
          >
            + Add Scene
          </button>
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-8 bg-omega-bg border border-omega-border rounded-md">
          <p className="text-omega-text/60 mb-2">No scenes found</p>
          <p className="text-xs text-omega-text/40">
            {project.script
              ? 'Generate scenes from your script or add manually'
              : 'Write a script first, then scenes will be auto-generated'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scenes.map((scene, index) => (
            <div key={scene.id} className="space-y-2">
              {/* Scene Card - Clickable */}
              <div
                onClick={() => handleSceneClick(scene)}
                className={`bg-omega-bg border rounded-md p-4 cursor-pointer transition-all ${
                  editingSceneId === scene.id
                    ? 'border-omega-accent/50 shadow-omega-glow'
                    : 'border-omega-border hover:border-omega-accent/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-omega-accent/20 border border-omega-accent/30 rounded-md flex items-center justify-center">
                    <span className="text-omega-accent font-bold">{scene.number}</span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-omega-text mb-1">
                      {scene.title}
                    </h4>
                    <p className="text-xs text-omega-text/60 line-clamp-2 mb-2">
                      {scene.description || 'No description'}
                    </p>
                    {scene.prompt && (
                      <p className="text-xs text-omega-text/50 italic">
                        Prompt: {scene.prompt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingSceneId === scene.id && (
                      <span className="text-xs text-omega-accent">💬 Chatting...</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveScene(index)
                      }}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors px-2 text-lg"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Chat Interface - Appears below clicked scene */}
              {editingSceneId === scene.id && (
                <div className="bg-omega-bg border border-omega-accent/30 rounded-md p-4 ml-16 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-omega-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-omega-accent text-xs">AI</span>
                    </div>
                    <span className="text-xs font-semibold text-omega-text">
                      AI Scene Editor
                    </span>
                  </div>

                  {/* Chat Messages */}
                  <div className="bg-omega-panel border border-omega-border rounded-md p-3 h-64 overflow-y-auto space-y-3">
                    {(chatMessages[scene.id] || []).map((message, msgIndex) => (
                      <div
                        key={msgIndex}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.role === 'user'
                              ? 'bg-omega-accent text-white'
                              : 'bg-omega-bg border border-omega-border text-omega-text'
                          }`}
                        >
                          <p className="text-xs leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-omega-bg border border-omega-border rounded-lg px-3 py-2">
                          <div className="flex gap-1">
                            <span className="text-omega-text/60 text-xs">AI is thinking</span>
                            <span className="animate-pulse">...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(index)
                        }
                      }}
                      placeholder="Tell AI how to edit this scene..."
                      className="flex-1 bg-omega-panel border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleSendMessage(index)}
                      disabled={isLoading || !currentMessage.trim()}
                      className="px-4 py-2 bg-omega-accent hover:bg-omega-accent/90 rounded-md text-white text-sm font-semibold transition-all shadow-omega-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
