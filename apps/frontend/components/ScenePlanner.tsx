'use client'

import { useState, useEffect } from 'react'
import { Scene, setScenes } from '@/redux/projectSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { parseScenesFromScript } from '@/lib/sceneParser'

interface ScenePlannerProps {
  projectId: string
}

export default function ScenePlanner({ projectId }: ScenePlannerProps) {
  const dispatch = useAppDispatch()
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const [scenes, setLocalScenes] = useState<Scene[]>(project?.scenes || [])

  useEffect(() => {
    if (project?.script && !project.scenes) {
      // Auto-parse scenes when script changes
      const parsed = parseScenesFromScript(project.script)
      if (parsed.length > 0) {
        setLocalScenes(parsed)
        dispatch(setScenes({ projectId, scenes: parsed }))
      }
    } else if (project?.scenes) {
      setLocalScenes(project.scenes)
    }
  }, [project?.script, project?.scenes, projectId, dispatch])

  const handleUpdateScene = (index: number, updates: Partial<Scene>) => {
    const updated = [...scenes]
    updated[index] = { ...updated[index], ...updates }
    setLocalScenes(updated)
    dispatch(setScenes({ projectId, scenes: updated }))
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
  }

  const handleRemoveScene = (index: number) => {
    const updated = scenes.filter((_, i) => i !== index)
    // Renumber scenes
    updated.forEach((scene, i) => {
      scene.number = i + 1
    })
    setLocalScenes(updated)
    dispatch(setScenes({ projectId, scenes: updated }))
  }

  if (scenes.length === 0) {
    return (
      <div className="bg-omega-panel border border-omega-border rounded-md p-6">
        <div className="text-center">
          <p className="text-omega-text/60 mb-4">
            No scenes detected. Generate a script or add scenes manually.
          </p>
          <button
            onClick={handleAddScene}
            className="bg-omega-accent hover:bg-omega-accent/90 px-4 py-2 rounded-md text-white text-sm font-semibold transition-all"
          >
            + Add Scene
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-omega-text">
          Scenes ({scenes.length})
        </h3>
        <button
          onClick={handleAddScene}
          className="bg-omega-panel border border-omega-border hover:border-omega-accent/50 px-3 py-1.5 rounded-md text-omega-text text-sm font-medium transition-all"
        >
          + Add Scene
        </button>
      </div>

      <div className="space-y-3">
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            className="bg-omega-panel border border-omega-border rounded-md p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-omega-accent/20 border border-omega-accent/30 rounded-md flex items-center justify-center">
                <span className="text-omega-accent font-bold">{scene.number}</span>
              </div>

              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => handleUpdateScene(index, { title: e.target.value })}
                  className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                  placeholder="Scene title"
                />

                <textarea
                  value={scene.description}
                  onChange={(e) => handleUpdateScene(index, { description: e.target.value })}
                  className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-sm focus:outline-none focus:ring-2 focus:ring-omega-accent/50 resize-none h-20"
                  placeholder="Scene description..."
                />

                <input
                  type="text"
                  value={scene.prompt || ''}
                  onChange={(e) => handleUpdateScene(index, { prompt: e.target.value })}
                  className="w-full bg-omega-bg border border-omega-border rounded-md px-3 py-2 text-omega-text text-xs focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
                  placeholder="Custom video prompt (optional)"
                />
              </div>

              <button
                onClick={() => handleRemoveScene(index)}
                className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors px-2"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

