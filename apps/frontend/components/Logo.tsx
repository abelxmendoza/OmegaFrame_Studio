'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  useImage?: boolean // Set to true to use image file instead of SVG
}

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  useImage = true,
}: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'h-12 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  // Image dimensions based on size
  const imageSizes = {
    sm: 48,
    md: 64,
    lg: 96,
  }

  const shouldUseImage = useImage && !imageError

  return (
    <Link href="/dashboard" className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Use image if available, otherwise use SVG */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0 flex items-center`}>
        {shouldUseImage ? (
          <Image
            src="/images/OmegaFrameStudio_Logo.png"
            alt="OmegaFrame Studio"
            width={imageSizes[size] * 2}
            height={imageSizes[size]}
            className="h-full w-auto object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Film Reels */}
            <circle cx="30" cy="25" r="12" fill="#7938ff" opacity="0.9" />
            <circle cx="70" cy="25" r="12" fill="#7938ff" opacity="0.9" />
            <circle cx="30" cy="25" r="8" fill="#0b0b0f" />
            <circle cx="70" cy="25" r="8" fill="#0b0b0f" />

            {/* Camera Body */}
            <rect x="25" y="35" width="50" height="35" rx="3" fill="#7938ff" />

            {/* Document Icon on Camera */}
            <rect x="35" y="42" width="20" height="25" rx="1" fill="#0b0b0f" opacity="0.3" />
            <line x1="38" y1="48" x2="50" y2="48" stroke="#7938ff" strokeWidth="1.5" />
            <line x1="38" y1="53" x2="50" y2="53" stroke="#7938ff" strokeWidth="1.5" />
            <line x1="38" y1="58" x2="50" y2="58" stroke="#7938ff" strokeWidth="1.5" />

            {/* Lens/Viewfinder */}
            <circle cx="75" cy="52" r="6" fill="#0b0b0f" />
            <circle cx="75" cy="52" r="4" fill="#7938ff" opacity="0.5" />

            {/* Film Strip */}
            <rect x="48" y="70" width="4" height="20" fill="#7938ff" />
            <rect x="45" y="75" width="10" height="3" fill="#0b0b0f" />
            <rect x="45" y="82" width="10" height="3" fill="#0b0b0f" />

            {/* Circuit Board Elements - Red lines */}
            <line
              x1="15"
              y1="40"
              x2="25"
              y2="50"
              stroke="#ff4444"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="20"
              y1="30"
              x2="30"
              y2="35"
              stroke="#ff4444"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="75"
              y1="20"
              x2="85"
              y2="25"
              stroke="#ff4444"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="80"
              y1="30"
              x2="85"
              y2="40"
              stroke="#ff4444"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Circuit Nodes */}
            <circle cx="15" cy="40" r="2" fill="#ff4444" opacity="0.8" />
            <circle cx="20" cy="30" r="2" fill="#ff4444" opacity="0.8" />
            <circle cx="85" cy="25" r="2" fill="#ff4444" opacity="0.8" />
            <circle cx="85" cy="40" r="2" fill="#ff4444" opacity="0.8" />
          </svg>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold text-omega-accent ${textSizes[size]} leading-tight tracking-tight`}
            style={{
              textShadow: '0 0 10px rgba(121, 56, 255, 0.5)',
            }}
          >
            OMEGAFRAME
          </span>
          <span
            className={`font-bold text-omega-accent ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} leading-tight tracking-tight opacity-90`}
            style={{
              textShadow: '0 0 8px rgba(121, 56, 255, 0.4)',
            }}
          >
            STUDIO
          </span>
        </div>
      )}
    </Link>
  )
}
