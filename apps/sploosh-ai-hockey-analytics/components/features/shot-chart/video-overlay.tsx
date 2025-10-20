/**
 * VideoOverlay - Modal overlay for displaying NHL highlight videos
 */

'use client'

import * as React from 'react'

interface VideoOverlayProps {
  videoUrl: string
  onClose: () => void
  playerName: string
  teamAbbrev?: string
}

export const VideoOverlay: React.FC<VideoOverlayProps> = ({
  videoUrl,
  onClose,
  playerName,
  teamAbbrev,
}) => {
  const overlayRef = React.useRef<HTMLDivElement>(null)

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Close on click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-4xl my-auto bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <h3 className="font-semibold text-sm">
              {teamAbbrev && `${teamAbbrev} - `}{playerName} Goal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-muted transition-colors"
            aria-label="Close video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Video Container - 16:9 aspect ratio */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${playerName} Goal Highlight`}
          />
        </div>

        {/* Footer hint */}
        <div className="px-4 py-1.5 text-[11px] text-muted-foreground text-center border-t border-border bg-muted/30">
          Press ESC or click outside to close
        </div>
      </div>
    </div>
  )
}
