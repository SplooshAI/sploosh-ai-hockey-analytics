/**
 * ShotTooltip - Rich HTML tooltip for shot events with images
 */

'use client'

import * as React from 'react'
import { type ShotEvent } from '@/lib/utils/shot-chart-utils'

interface ShotTooltipProps {
  shot: ShotEvent
  playerName: string
  teamLogo?: string
  teamName?: string
  teamAbbrev?: string
  teamColor?: string
  playerHeadshot?: string
  visible: boolean
  x: number
  y: number
}

export const ShotTooltip: React.FC<ShotTooltipProps> = ({
  shot,
  playerName,
  teamLogo,
  teamName,
  teamAbbrev,
  teamColor,
  playerHeadshot,
  visible,
  x,
  y,
}) => {
  // Calculate smart positioning for mobile - hooks must be called before any returns
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({})
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const resultText = shot.result === 'goal' 
    ? '⭐ GOAL' 
    : shot.result === 'shot-on-goal'
    ? '🎯 Shot on Goal'
    : shot.result === 'missed-shot'
    ? '❌ Missed Shot'
    : '🛡️ Blocked Shot'

  // Use team color for header background if available
  const resultColorClass = shot.result === 'goal'
    ? 'bg-green-500'
    : shot.result === 'shot-on-goal'
    ? 'bg-blue-500'
    : 'bg-gray-500'
  
  const headerStyle = teamColor ? {
    backgroundColor: teamColor,
    color: '#FFFFFF'
  } : {}

  React.useEffect(() => {
    if (!tooltipRef.current) return

    const calculatePosition = () => {
      if (!tooltipRef.current) return

      const tooltip = tooltipRef.current
      const tooltipRect = tooltip.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const isMobile = viewportWidth < 768

      let finalX = x
      let finalY = y
      let transform = 'translate(-50%, -120%)'

      if (isMobile) {
        // On mobile, center tooltip at bottom of screen
        finalX = viewportWidth / 2
        finalY = viewportHeight - 20
        transform = 'translate(-50%, -100%)'
      } else {
        // Desktop: smart positioning to keep in viewport
        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height

        // Check if tooltip would go off right edge
        if (x + tooltipWidth / 2 > viewportWidth - 20) {
          finalX = viewportWidth - tooltipWidth / 2 - 20
        }
        // Check if tooltip would go off left edge
        if (x - tooltipWidth / 2 < 20) {
          finalX = tooltipWidth / 2 + 20
        }

        // Check if tooltip would go off top edge
        if (y - tooltipHeight - 20 < 20) {
          // Position below the marker instead
          transform = 'translate(-50%, 20%)'
        }
      }

      setTooltipStyle({
        left: `${finalX}px`,
        top: `${finalY}px`,
        transform,
      })
    }

    // Calculate initial position
    calculatePosition()

    // Recalculate on window resize/orientation change
    window.addEventListener('resize', calculatePosition)
    window.addEventListener('orientationchange', calculatePosition)

    return () => {
      window.removeEventListener('resize', calculatePosition)
      window.removeEventListener('orientationchange', calculatePosition)
    }
  }, [x, y, visible])

  if (!visible) return null

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 transition-all duration-200"
      style={tooltipStyle}
    >
      <div className="bg-background/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-2xl p-3 min-w-[280px] max-w-[calc(100vw-40px)] md:max-w-[320px]">
        {/* Header with Result Type and Team */}
        <div 
          className={`${teamColor ? '' : resultColorClass} text-white px-3 py-1.5 rounded-md mb-2 font-bold text-sm`}
          style={headerStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{resultText.split(' ')[0]}</span>
              <span>{resultText.split(' ').slice(1).join(' ')}</span>
            </div>
            {teamAbbrev && (
              <span className="text-xs font-semibold opacity-90">{teamAbbrev}</span>
            )}
          </div>
        </div>

        {/* Player Info with Headshot */}
        <div className="flex items-center gap-3 mb-3">
          {playerHeadshot && (
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-border">
              <img
                src={playerHeadshot}
                alt={playerName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base truncate">{playerName}</div>
            {teamLogo && (
              <img
                src={teamLogo}
                alt="Team"
                className="h-6 mt-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
          </div>
        </div>

        {/* Shot Details */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Period:</span>
            <span className="font-medium">Period {shot.period} - {shot.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shot Type:</span>
            <span className="font-medium capitalize">{shot.shotType?.replace('-', ' ') || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Zone:</span>
            <span className="font-medium">{shot.zone || 'N/A'}</span>
          </div>
          
          {/* Technical Details (Collapsible) */}
          <details className="mt-2 pt-2 border-t border-border">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground text-xs">
              Technical Details
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NHL Coords:</span>
                <span className="font-mono">({shot.xCoord}, {shot.yCoord})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event ID:</span>
                <span className="font-mono">{shot.eventId}</span>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Tooltip Arrow */}
      <div 
        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid hsl(var(--border))',
        }}
      />
    </div>
  )
}
