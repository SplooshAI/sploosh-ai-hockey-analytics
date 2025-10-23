/**
 * VideoOverlay - Modal overlay for displaying NHL highlight videos
 */

'use client'

import * as React from 'react'
import { VideoUnavailable } from './video-unavailable'

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
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [videoError, setVideoError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

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

  // Monitor iframe for video availability
  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Listen for iframe load event
    const handleLoad = () => {
      setIsLoading(false)
    }

    // Listen for iframe error event
    const handleError = () => {
      setVideoError(true)
      setIsLoading(false)
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)

    // Listen for postMessage events from Brightcove player
    const handleMessage = (event: MessageEvent) => {
      // Verify that the message comes from the expected video source
      if (event.origin !== new URL(videoUrl).origin) return;
      // Brightcove player sends messages about video state
      // Check if it's an error message
      if (event.data && typeof event.data === 'object') {
        // Look for error indicators in the message
        if (event.data.error || event.data.type === 'error' || 
            (event.data.event === 'error') || 
            (event.data.message && event.data.message.includes('not available'))) {
          setVideoError(true)
          setIsLoading(false)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Set a timeout - if loading takes too long, assume there might be an issue
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      window.removeEventListener('message', handleMessage)
    }
  }, [videoUrl])

  // Reset error and loading UI when a new video URL is provided
  React.useEffect(() => {
    setVideoError(false)
    setIsLoading(true)
  }, [videoUrl])

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
          {videoError ? (
            // Show fallback when video fails to load
            <div className="absolute inset-0 w-full h-full">
              <VideoUnavailable />
            </div>
          ) : (
            <>
              <iframe
                ref={iframeRef}
                src={videoUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`${playerName} Goal Highlight`}
              />
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="animate-spin h-10 w-10 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-white text-sm">Loading highlight...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-1.5 text-[11px] text-muted-foreground text-center border-t border-border bg-muted/30">
          Press ESC or click outside to close
        </div>
      </div>
    </div>
  )
}
