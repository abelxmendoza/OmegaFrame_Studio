'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppDispatch } from '@/redux/hooks'
import { updateProjectName } from '@/redux/projectSlice'
import { ProjectThumbnail } from './thumbnails/ProjectThumbnail'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    clips?: any[]
    script?: string
    topic?: string
    status?: string
    createdAt?: string
    updatedAt?: string
    thumbnail?: string
    thumbnail_url?: string
    videoUrl?: string
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)

  const statusColors = {
    draft: 'bg-omega-panel/50 text-omega-text/70 border-omega-border',
    generating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    rendering: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editedName.trim()) {
      dispatch(updateProjectName({ projectId: project.id, name: editedName.trim() }))
    } else {
      setEditedName(project.name)
    }
    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditedName(project.name)
    setIsEditing(false)
  }

  return (
    <div className="bg-omega-panel border border-omega-border rounded-md p-6 hover:border-omega-accent/50 transition-all group">
      {/* Thumbnail */}
      <Link href={`/project/${project.id}`}>
        <div className="w-full h-32 rounded mb-4 overflow-hidden border border-omega-border group-hover:border-omega-accent/30 transition-colors cursor-pointer relative">
          <ProjectThumbnail
            src={project.thumbnail_url || project.thumbnail}
            alt={project.name}
            className="w-full h-32"
          />
          {project.videoUrl && (
            <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded shadow-lg z-10">
              ✓ Video Ready
            </div>
          )}
        </div>
      </Link>

      <div className="flex items-start justify-between mb-2">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave(e as any)
                if (e.key === 'Escape') handleCancel(e as any)
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-omega-bg border border-omega-accent/50 rounded px-2 py-1 text-omega-text text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-omega-accent/50"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="text-green-400 hover:text-green-300 text-sm px-2"
              title="Save"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="text-red-400 hover:text-red-300 text-sm px-2"
              title="Cancel"
            >
              ×
            </button>
          </div>
        ) : (
          <h3
            className="text-lg font-semibold text-omega-text flex-1 cursor-pointer hover:text-omega-accent transition-colors group/edit"
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            title="Click to edit project name"
          >
            {project.name}
            <span className="ml-2 text-xs text-omega-text/40 opacity-0 group-hover/edit:opacity-100 transition-opacity">
              ✏️
            </span>
          </h3>
        )}
        {project.status && !isEditing && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-md border ml-2 ${
              statusColors[project.status as keyof typeof statusColors] ||
              statusColors.draft
            }`}
          >
            {project.status}
          </span>
        )}
      </div>

      {project.topic && (
        <p className="text-sm text-omega-text/60 mb-3 line-clamp-2">{project.topic}</p>
      )}

      <div className="flex items-center justify-between text-xs text-omega-text/50">
        <span>{project.clips?.length || 0} clips</span>
        {project.updatedAt && (
          <span>
            {new Date(project.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      <Link
        href={`/project/${project.id}`}
        className="mt-3 block text-xs text-omega-accent hover:text-omega-accent/80 transition-colors"
      >
        Open Project →
      </Link>
    </div>
  )
}

