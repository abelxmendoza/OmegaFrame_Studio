'use client'

import { useState } from 'react'

interface HelpTooltipProps {
  content: string
  children?: React.ReactNode
}

export default function HelpTooltip({ content, children }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-omega-text/40 hover:text-omega-accent transition-colors"
        type="button"
      >
        {children || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        )}
      </button>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-omega-panel border border-omega-border rounded-md shadow-lg text-xs text-omega-text/80 left-0 top-6">
          {content}
        </div>
      )}
    </div>
  )
}

