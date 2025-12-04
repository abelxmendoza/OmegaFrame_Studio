'use client'

interface ProjectThumbnailProps {
  src?: string | null
  alt?: string
  className?: string
}

export function ProjectThumbnail({ src, alt = 'Project thumbnail', className = '' }: ProjectThumbnailProps) {
  // Construct full URL if needed
  const getFullUrl = (url: string | null | undefined) => {
    if (!url) return '/images/placeholder-thumbnail.png'
    
    // If it's already a full URL, return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // If it's a Supabase URL, return as-is
    if (url.includes('supabase.co')) {
      return url
    }
    
    // Otherwise, assume it's a relative path from backend
    const pythonRenderUrl = process.env.NEXT_PUBLIC_PYTHON_RENDER_URL || 'http://localhost:8000'
    return `${pythonRenderUrl}${url.startsWith('/') ? url : '/' + url}`
  }

  const fullUrl = getFullUrl(src)

  return (
    <div className={`overflow-hidden rounded-lg border border-omega-border/50 bg-omega-bg/50 ${className}`}>
      <img
        src={fullUrl}
        alt={alt}
        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-200"
        onError={(e) => {
          // Fallback to placeholder on error
          const target = e.target as HTMLImageElement
          if (target.src !== '/images/placeholder-thumbnail.png') {
            target.src = '/images/placeholder-thumbnail.png'
          }
        }}
      />
    </div>
  )
}

