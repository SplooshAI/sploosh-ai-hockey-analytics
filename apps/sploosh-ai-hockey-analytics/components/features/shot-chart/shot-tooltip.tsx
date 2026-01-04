/**
 * ShotTooltip - Rich HTML tooltip for shot events with images
 */

'use client'

import * as React from 'react'
import { type ShotEvent } from '@/lib/utils/shot-chart-utils'
import { formatPeriodLabel, formatGameTime, formatSituationCode } from '@/lib/utils/formatters'

interface ShotTooltipProps {
  shot: ShotEvent
  playerName: string
  teamLogo?: string
  teamName?: string // Reserved for future use
  teamAbbrev?: string
  teamColor?: string
  playerHeadshot?: string
  assistNames?: string[]
  goalieInNetName?: string
  gameData?: any
  onWatchReplay?: () => void
  visible: boolean
  x: number
  y: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onDismiss?: () => void
}

export const ShotTooltip: React.FC<ShotTooltipProps> = ({
  shot,
  playerName,
  teamLogo,
  teamName: _teamName, // Reserved for future use
  teamAbbrev,
  teamColor,
  playerHeadshot,
  assistNames,
  goalieInNetName,
  gameData,
  onWatchReplay,
  visible,
  x,
  y,
  onMouseEnter,
  onMouseLeave,
  onDismiss,
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
      let transform = 'translate(-50%, calc(-100% - 10px))' // Position directly above marker with small gap

      if (isMobile) {
        // On mobile, center tooltip at bottom of screen
        finalX = viewportWidth / 2
        finalY = viewportHeight - 20
        transform = 'translate(-50%, -100%)'
      } else {
        // Desktop: smart positioning to keep in viewport
        const tooltipWidth = tooltipRect.width
        const tooltipHeight = tooltipRect.height
        const gap = 10 // Small gap between marker and tooltip

        // Check if tooltip would go off right edge
        if (x + tooltipWidth / 2 > viewportWidth - 20) {
          finalX = viewportWidth - tooltipWidth / 2 - 20
        }
        // Check if tooltip would go off left edge
        if (x - tooltipWidth / 2 < 20) {
          finalX = tooltipWidth / 2 + 20
        }

        // Check if tooltip would go off top edge
        if (y - tooltipHeight - gap < 20) {
          // Position below the marker instead
          transform = `translate(-50%, ${gap}px)`
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
      className="fixed z-50 transition-all duration-200 pointer-events-auto"
      style={tooltipStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="bg-background/95 backdrop-blur-sm border-2 border-border rounded-lg shadow-2xl p-3 min-w-[280px] max-w-[calc(100vw-40px)] md:max-w-[320px]">
        {/* Header with Result Type and Team */}
        <div 
          className={`${teamColor ? '' : resultColorClass} text-white px-3 py-1.5 rounded-md mb-2 font-bold text-sm`}
          style={headerStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{resultText.split(' ')[0]}</span>
              <span>{resultText.split(' ').slice(1).join(' ')}</span>
            </div>
            {teamAbbrev && (
              <span className="text-xs font-semibold opacity-90">{teamAbbrev}</span>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 hover:bg-white/20 rounded p-1 transition-colors touch-manipulation"
                aria-label="Close tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
          {(() => {
            const timeInfo = formatGameTime(shot.period, shot.time, shot.timeRemaining)
            return (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">{formatPeriodLabel(shot.period)} - {timeInfo.elapsed}</span>
                </div>
                {timeInfo.remaining && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"></span>
                    <span className="font-medium text-muted-foreground">{timeInfo.remaining}</span>
                  </div>
                )}
              </>
            )
          })()}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shot Type:</span>
            <span className="font-medium capitalize">{shot.shotType?.replace('-', ' ') || 'Unknown'}</span>
          </div>
          
          {/* Shot Analytics */}
          {(shot.distance !== undefined || shot.angle !== undefined || shot.situationCode) && (
            <div className="flex gap-2 mt-2">
              {shot.distance !== undefined && (
                <div className="flex-1 bg-muted/50 rounded px-2 py-1">
                  <div className="text-[10px] text-muted-foreground">Distance</div>
                  <div className="font-bold text-sm">{shot.distance} ft</div>
                </div>
              )}
              {shot.angle !== undefined && (
                <div className="flex-1 bg-muted/50 rounded px-2 py-1">
                  <div className="text-[10px] text-muted-foreground">Angle</div>
                  <div className="font-bold text-sm">{shot.angle}°</div>
                </div>
              )}
              {(() => {
                const situation = formatSituationCode(shot.situationCode)
                if (!situation) return null
                
                // Determine if this is PP or SH for the shooting team
                const situationCode = shot.situationCode || ''
                if (situationCode.length !== 4) return null
                
                // Check if this is a goalie pulled situation (empty net)
                // Situation code format: ABCD where A=away goalie, D=home goalie (1=in, 0=pulled)
                const awayGoalieIn = situationCode[0] === '1'
                const homeGoalieIn = situationCode[3] === '1'
                
                // If ANY goalie is pulled, show with colored background matching timeline badges
                // This covers both empty net goals and goals scored with own goalie pulled
                if (!awayGoalieIn || !homeGoalieIn) {
                  // Determine if it's an empty net goal or goal with own goalie pulled
                  const isAwayTeam = shot.teamId === gameData?.awayTeam?.id
                  const isEmptyNet = (isAwayTeam && !homeGoalieIn) || (!isAwayTeam && !awayGoalieIn)
                  
                  // Parse skater counts from situation code
                  // Note: The situation code already reflects the actual skaters on ice
                  // When a goalie is pulled, the skater count includes the extra attacker
                  const awaySkaters = parseInt(situationCode[1])
                  const homeSkaters = parseInt(situationCode[2])
                  
                  // Display from shooting team's perspective (shooting team first)
                  const shootingTeamOnIce = isAwayTeam ? awaySkaters : homeSkaters
                  const opposingTeamOnIce = isAwayTeam ? homeSkaters : awaySkaters
                  const situationDisplay = `${shootingTeamOnIce}v${opposingTeamOnIce} ENG`
                  
                  // Different colors: cyan for empty net (icing on the cake), green for +1 skater (successful risky play)
                  const bgColor = isEmptyNet ? 'bg-cyan-500/20' : 'bg-green-500/20'
                  const textColor = isEmptyNet ? 'text-cyan-600' : 'text-green-600'
                  
                  return (
                    <div className={`flex-1 ${bgColor} rounded px-2 py-1`}>
                      <div className="text-[10px] text-muted-foreground">Situation</div>
                      <div className={`text-sm ${textColor} font-bold`}>{situationDisplay}</div>
                    </div>
                  )
                }
                
                // Parse 4-digit code: ABCD where B=away skaters, C=home skaters
                const awaySkaters = parseInt(situationCode[1])
                const homeSkaters = parseInt(situationCode[2])
                
                let situationLabel = situation.text
                let bgColor = 'bg-muted/30'
                let textColor = 'text-muted-foreground'
                
                if (awaySkaters !== homeSkaters && gameData) {
                  // Determine if shooting team is away or home
                  const isAwayTeam = shot.teamId === gameData?.awayTeam?.id
                  const shootingTeamSkaters = isAwayTeam ? awaySkaters : homeSkaters
                  const opposingTeamSkaters = isAwayTeam ? homeSkaters : awaySkaters
                  const playerDifference = Math.abs(shootingTeamSkaters - opposingTeamSkaters)
                  
                  // Display from shooting team's perspective (shooting team skaters first)
                  situationLabel = `${shootingTeamSkaters}v${opposingTeamSkaters}`
                  
                  // Shooting team has advantage (power play) - GREEN
                  if (shootingTeamSkaters > opposingTeamSkaters) {
                    situationLabel = `${situationLabel} PP`
                    bgColor = 'bg-green-500/20'
                    textColor = 'text-green-600 font-bold'
                  }
                  // Shooting team is shorthanded by 1 - YELLOW
                  else if (shootingTeamSkaters < opposingTeamSkaters && playerDifference === 1) {
                    situationLabel = `${situationLabel} SH`
                    bgColor = 'bg-yellow-500/20'
                    textColor = 'text-yellow-600 font-bold'
                  }
                  // Shooting team is shorthanded by 2+ - RED
                  else if (shootingTeamSkaters < opposingTeamSkaters && playerDifference >= 2) {
                    situationLabel = `${situationLabel} SH`
                    bgColor = 'bg-red-500/20'
                    textColor = 'text-red-600 font-bold'
                  }
                }
                
                return (
                  <div className={`flex-1 rounded px-2 py-1 ${bgColor}`}>
                    <div className="text-[10px] text-muted-foreground">Situation</div>
                    <div className={`text-sm ${textColor}`}>{situationLabel}</div>
                  </div>
                )
              })()}
            </div>
          )}
          
          {/* Assists (for goals) */}
          {shot.result === 'goal' && assistNames && assistNames.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground mb-1">Assists</div>
              <div className="text-xs space-y-0.5">
                {assistNames.map((name, idx) => (
                  <div key={idx} className="font-medium">
                    {idx === 0 ? '1st: ' : '2nd: '}{name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Goalie (for saves/goals) */}
          {goalieInNetName && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground mb-1">
                {shot.result === 'goal' ? 'Goalie Beaten' : 'Goalie'}
              </div>
              <div className="text-xs font-medium">{goalieInNetName}</div>
            </div>
          )}
          
          {/* Watch Replay button for goals */}
          {shot.result === 'goal' && shot.highlightClipId && onWatchReplay && (
            <div className="mt-2 pt-2 border-t border-border">
              <button
                onClick={onWatchReplay}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Replay
              </button>
            </div>
          )}
          
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
    </div>
  )
}
