/**
 * ShotChartOverlay - Renders shot markers on top of the NHL rink
 * 
 * Displays shots, goals, and missed shots with different visual markers:
 * - Goals: Star shape with gold stroke
 * - Shots on goal: Filled circles
 * - Missed/Blocked shots: Circles with dashed stroke
 * 
 * @example
 * <ShotChartOverlay
 *   shots={parsedShots}
 *   rosterSpots={gameData.rosterSpots}
 *   showTooltips={true}
 * />
 */

import * as React from 'react'
import { transformCoordinates, getTeamColor, getTeamColorWithContrast, getStandardizedShotColor, getPlayerName, type ShotEvent } from '@/lib/utils/shot-chart-utils'
import { formatPeriodLabel, formatGameTime } from '@/lib/utils/formatters'
import { ShotTooltip } from './shot-tooltip'

interface ShotChartOverlayProps {
  /** Array of shot events to display */
  shots: ShotEvent[]
  /** Roster information for player names */
  rosterSpots?: any[]
  /** Game data for team logos */
  gameData?: any
  /** Whether to show tooltips on hover */
  showTooltips?: boolean
  /** Optional className for styling */
  className?: string
  /** Callback when shot is hovered */
  onShotHover?: (shot: ShotEvent | null, clientX?: number, clientY?: number) => void
  /** Scale factor for marker sizes */
  markerScale?: number
  /** Currently selected shot to highlight */
  selectedShot?: ShotEvent | null
}

/**
 * Renders a star shape for goals
 */
const GoalMarker: React.FC<{
  cx: number
  cy: number
  color: string
  shot: ShotEvent
  tooltip?: string
  onMouseEnter?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseLeave?: () => void
  scale?: number
  teamLogo?: string
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave, scale = 1, teamLogo }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    setIsHovered(true)
    onMouseEnter?.(e)
  }

  const handleInteractionEnd = () => {
    setIsHovered(false)
    onMouseLeave?.()
  }
  
  // Create a 5-pointed star - scaled size (goals are largest)
  const points = []
  const baseOuter = 20 * scale // Goals get 1.25x multiplier
  const baseInner = 9 * scale
  const outerRadius = isHovered ? baseOuter * 1.25 : baseOuter
  const innerRadius = isHovered ? baseInner * 1.25 : baseInner
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }

  return (
    <g>
      {/* Invisible larger touch target for mobile - 60 SVG units (≈44px on screen) */}
      <circle
        cx={cx}
        cy={cy}
        r={60}
        fill={isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
        className="cursor-pointer transition-all"
        onMouseEnter={(e) => {
          setIsHovered(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onMouseLeave?.()
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          setIsHovered(true)
          onMouseEnter?.(e)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          setIsHovered(false)
          onMouseLeave?.()
        }}
      >
        {tooltip && <title>{tooltip}</title>}
      </circle>
      {/* Visual star marker */}
      <polygon
        points={points.join(' ')}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={isHovered ? 4 : 3}
        className="pointer-events-none transition-all duration-200"
        style={{ filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none' }}
      />
      {/* Team color accent ring */}
      <polygon
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={isHovered ? 2 : 1.5}
        strokeDasharray="none"
        className="pointer-events-none transition-all duration-200"
        style={{ transform: 'scale(1.15)', transformOrigin: `${cx}px ${cy}px` }}
      />
    </g>
  )
}

/**
 * Renders a circle for shots on goal
 */
const ShotMarker: React.FC<{
  cx: number
  cy: number
  color: string
  shot: ShotEvent
  tooltip?: string
  onMouseEnter?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseLeave?: () => void
  scale?: number
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave, scale = 1 }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const baseRadius = 12 * scale

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    setIsHovered(true)
    onMouseEnter?.(e)
  }

  const handleInteractionEnd = () => {
    setIsHovered(false)
    onMouseLeave?.()
  }
  
  return (
    <g>
      {/* Invisible larger touch target for mobile - 60 SVG units (≈44px on screen) */}
      <circle
        cx={cx}
        cy={cy}
        r={60}
        fill={isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
        className="cursor-pointer transition-all"
        onMouseEnter={handleInteraction}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={(e) => {
          e.preventDefault()
          handleInteraction(e)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleInteractionEnd()
        }}
      >
        {tooltip && <title>{tooltip}</title>}
      </circle>
      {/* Visual shot marker */}
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? baseRadius * 1.2 : baseRadius}
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={isHovered ? 3 : 2}
        className="pointer-events-none transition-all duration-200"
        style={{ filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none' }}
      />
    </g>
  )
}

/**
 * Renders an X mark for missed or blocked shots
 */
const MissedShotMarker: React.FC<{
  cx: number
  cy: number
  color: string
  shot: ShotEvent
  tooltip?: string
  onMouseEnter?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseLeave?: () => void
  scale?: number
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave, scale = 1 }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const baseSize = 11 * scale
  const size = isHovered ? baseSize * 1.27 : baseSize

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    setIsHovered(true)
    onMouseEnter?.(e)
  }

  const handleInteractionEnd = () => {
    setIsHovered(false)
    onMouseLeave?.()
  }
  
  return (
    <g>
      {/* Invisible larger touch target for mobile - 60 SVG units (≈44px on screen) */}
      <circle
        cx={cx}
        cy={cy}
        r={60}
        fill={isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
        className="cursor-pointer transition-all"
        onMouseEnter={handleInteraction}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={(e) => {
          e.preventDefault()
          handleInteraction(e)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          handleInteractionEnd()
        }}
      >
        {tooltip && <title>{tooltip}</title>}
      </circle>
      {/* Visual X marker */}
      <g 
        className="pointer-events-none transition-all duration-200"
        style={{ filter: isHovered ? `drop-shadow(0 0 4px ${color})` : 'none' }}
      >
        <line
          x1={cx - size}
          y1={cy - size}
          x2={cx + size}
          y2={cy + size}
          stroke={color}
          strokeWidth={isHovered ? 4 : 3}
          strokeLinecap="round"
        />
        <line
          x1={cx - size}
          y1={cy + size}
          x2={cx + size}
          y2={cy - size}
          stroke={color}
          strokeWidth={isHovered ? 4 : 3}
          strokeLinecap="round"
        />
      </g>
    </g>
  )
}

export const ShotChartOverlay: React.FC<ShotChartOverlayProps> = ({
  shots,
  rosterSpots = [],
  gameData,
  showTooltips = true,
  className = '',
  onShotHover,
  markerScale = 1,
  selectedShot = null,
}) => {
  const handleMouseEnter = (shot: ShotEvent, clientX: number, clientY: number) => {
    if (!showTooltips || !onShotHover) return
    onShotHover(shot, clientX, clientY)
  }

  const handleMouseLeave = () => {
    if (!onShotHover) return
    onShotHover(null)
  }

  // Get team IDs for color calculation
  const homeTeamId = gameData?.homeTeam?.id
  const awayTeamId = gameData?.awayTeam?.id

  return (
    <g className={className}>
      {shots.map((shot, idx) => {
        const { cx, cy } = transformCoordinates(shot.xCoord, shot.yCoord)
        // Use team colors with automatic contrast adjustment
        const color = (homeTeamId && awayTeamId) 
          ? getTeamColorWithContrast(homeTeamId, awayTeamId, shot.teamId)
          : getTeamColor(shot.teamId)
        const isSelected = selectedShot?.eventId === shot.eventId
        
        // Get team logo for goals
        const team = shot.teamId === gameData?.awayTeam?.id 
          ? gameData?.awayTeam 
          : gameData?.homeTeam
        const teamLogo = team?.logo || team?.darkLogo
        
        // Build detailed tooltip text
        let tooltip = ''
        if (showTooltips) {
          const playerName = shot.playerId 
            ? getPlayerName(shot.playerId, rosterSpots)
            : 'Unknown'
          const resultText = shot.result === 'goal' 
            ? '⭐ GOAL' 
            : shot.result === 'shot-on-goal'
            ? '🎯 Shot on Goal'
            : shot.result === 'missed-shot'
            ? '❌ Missed Shot'
            : '🛡️ Blocked Shot'
          
          const { cx: svgX, cy: svgY } = transformCoordinates(shot.xCoord, shot.yCoord)
          
          tooltip = [
            resultText,
            `Player: ${playerName}`,
            `${formatPeriodLabel(shot.period)} - ${formatGameTime(shot.period, shot.time, shot.timeRemaining)}`,
            `Shot Type: ${shot.shotType || 'Unknown'}`,
            `Zone: ${shot.zone || 'N/A'}`,
            `NHL Coords: (${shot.xCoord}, ${shot.yCoord})`,
            `SVG Coords: (${Math.round(svgX)}, ${Math.round(svgY)})`,
            `Event ID: ${shot.eventId}`
          ].join('\n')
        }

        // Render appropriate marker based on shot result
        const markerProps = {
          cx,
          cy,
          color,
          shot,
          tooltip,
          onMouseEnter: (e: React.MouseEvent | React.TouchEvent) => {
            // Get client coordinates from either mouse or touch event
            const clientX = 'clientX' in e ? e.clientX : e.touches[0]?.clientX || 0
            const clientY = 'clientY' in e ? e.clientY : e.touches[0]?.clientY || 0
            handleMouseEnter(shot, clientX, clientY)
          },
          onMouseLeave: handleMouseLeave,
          scale: markerScale,
        }

        const marker = shot.result === 'goal' ? (
          <GoalMarker
            key={`shot-${shot.eventId}-${idx}`}
            {...markerProps}
            teamLogo={teamLogo}
          />
        ) : shot.result === 'shot-on-goal' ? (
          <ShotMarker
            key={`shot-${shot.eventId}-${idx}`}
            {...markerProps}
          />
        ) : (
          <MissedShotMarker
            key={`shot-${shot.eventId}-${idx}`}
            {...markerProps}
          />
        )

        // Wrap selected marker with highly visible ring indicator
        if (isSelected) {
          return (
            <g key={`shot-${shot.eventId}-${idx}`}>
              {/* Large semi-transparent background circle */}
              <circle
                cx={cx}
                cy={cy}
                r={80}
                fill="rgba(255, 215, 0, 0.15)"
                stroke="none"
              />
              {/* Bright outer ring */}
              <circle
                cx={cx}
                cy={cy}
                r={75}
                fill="none"
                stroke="#FFD700"
                strokeWidth={5}
                opacity={1}
              >
                <animate
                  attributeName="r"
                  values="75;85;75"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.4;1"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Solid inner ring */}
              <circle
                cx={cx}
                cy={cy}
                r={70}
                fill="none"
                stroke="#FFD700"
                strokeWidth={4}
                opacity={0.9}
              />
              {marker}
            </g>
          )
        }

        return marker
      })}
    </g>
  )
}
