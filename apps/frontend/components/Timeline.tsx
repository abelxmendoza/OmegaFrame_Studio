'use client'

import { useAppSelector } from '@/redux/hooks'
import AudioPlayer from './AudioPlayer'

interface TimelineProps {
  projectId: string
}

export default function Timeline({ projectId }: TimelineProps) {
  const projects = useAppSelector((state) => state.project.projects)
  const project = projects[projectId]

  if (!project) return null

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-omega-text mb-2">Timeline</h2>
        <p className="text-sm text-omega-text/60">
          Preview your video composition. Shows all clips in order, audio track, and script preview. 
          This is how your final video will be assembled.
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Audio Track */}
        <div>
          <h3 className="text-sm font-medium text-omega-text/80 mb-3">Audio</h3>
          <AudioPlayer projectId={projectId} />
        </div>

        {/* Video Clips Timeline */}
        <div>
          <h3 className="text-sm font-medium text-omega-text/80 mb-3">Video Clips</h3>
          {!project.clips || project.clips.length === 0 ? (
            <div className="bg-omega-bg border border-omega-border rounded-md p-4 text-center">
              <p className="text-sm text-omega-text/60">No clips added yet</p>
            </div>
          ) : (
            <div className="bg-omega-bg border border-omega-border rounded-md p-4">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {project.clips.map((clip: any, index: number) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-24 h-16 bg-omega-panel border border-omega-border rounded-md overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="text-omega-text/30 text-xs font-bold">{index + 1}</span>
                    </div>
                    {clip.path || clip.url ? (
                      <video
                        src={clip.path || clip.url}
                        className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full bg-omega-panel flex items-center justify-center">
                        <span className="text-omega-text/20 text-xs">Clip {index + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-omega-text/40 mt-3">
                {project.clips.length} clip{project.clips.length !== 1 ? 's' : ''} • Draggable reorder coming soon
              </p>
            </div>
          )}
        </div>

        {/* Script Preview */}
        {project.script && (
          <div>
            <h3 className="text-sm font-medium text-omega-text/80 mb-3">Script Preview</h3>
            <div className="bg-omega-bg border border-omega-border rounded-md p-4">
              <p className="text-sm text-omega-text/70 line-clamp-4 font-mono text-xs">
                {project.script}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

