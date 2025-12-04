'use client'

import { useAppSelector } from '@/redux/hooks'

interface RenderProgressProps {
  projectId: string
}

export default function RenderProgress({ projectId }: RenderProgressProps) {
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]
  const generation = useAppSelector((state) => state.generation)

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-omega-text mb-2">Render Progress</h3>
        <p className="text-sm text-omega-text/60">
          Track the assembly of your final video. FFmpeg will combine all clips with audio narration 
          and create your completed video file.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="w-full bg-omega-bg rounded-full h-3 mb-2 overflow-hidden border border-omega-border">
            <div
              className="bg-omega-accent h-full rounded-full transition-all duration-300 shadow-omega-glow"
              style={{ width: `${generation.progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-omega-text/80">
              {generation.status === 'idle' && 'Ready to render'}
              {generation.status === 'rendering' && 'FFmpeg: concatenating clips...'}
              {generation.status === 'completed' && 'Complete!'}
              {generation.status === 'error' && 'Error occurred'}
            </p>
            <p className="text-sm font-semibold text-omega-accent">
              {Math.round(generation.progress)}%
            </p>
          </div>
        </div>

        {project && (
          <div className="bg-omega-bg border border-omega-border rounded-md p-4">
            <p className="text-xs text-omega-text/60 mb-1">Output:</p>
            <p className="text-sm text-omega-text font-mono">
              /projects/{projectId}/final.mp4
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
