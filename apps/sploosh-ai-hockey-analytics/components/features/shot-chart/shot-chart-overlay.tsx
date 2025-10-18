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
import { transformCoordinates, getTeamColor, getPlayerName, type ShotEvent } from '@/lib/utils/shot-chart-utils'
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
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: () => void
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  
  // Create a 5-pointed star - larger base size
  const points = []
  const outerRadius = isHovered ? 20 : 16
  const innerRadius = isHovered ? 9 : 7
  
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }

  return (
    <polygon
      points={points.join(' ')}
      fill={color}
      stroke="#FFD700"
      strokeWidth={isHovered ? 3 : 2}
      className="cursor-pointer transition-all duration-200"
      style={{ filter: isHovered ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none' }}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onMouseLeave?.()
      }}
    >
      {tooltip && <title>{tooltip}</title>}
    </polygon>
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
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: () => void
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isHovered ? 12 : 10}
      fill={color}
      stroke="#FFFFFF"
      strokeWidth={isHovered ? 3 : 2}
      className="cursor-pointer transition-all duration-200"
      style={{ filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none' }}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onMouseLeave?.()
      }}
    >
      {tooltip && <title>{tooltip}</title>}
    </circle>
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
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: () => void
}> = ({ cx, cy, color, shot, tooltip, onMouseEnter, onMouseLeave }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const size = isHovered ? 14 : 11
  
  return (
    <g 
      className="cursor-pointer transition-all duration-200"
      style={{ filter: isHovered ? `drop-shadow(0 0 4px ${color})` : 'none' }}
      onMouseEnter={(e) => {
        setIsHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        onMouseLeave?.()
      }}
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
      {tooltip && <title>{tooltip}</title>}
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
}) => {
  const handleMouseEnter = (shot: ShotEvent, clientX: number, clientY: number) => {
    if (!showTooltips || !onShotHover) return
    onShotHover(shot, clientX, clientY)
  }

  const handleMouseLeave = () => {
    if (!onShotHover) return
    onShotHover(null)
  }

  return (
    <g className={className}>
      {shots.map((shot, idx) => {
        const { cx, cy } = transformCoordinates(shot.xCoord, shot.yCoord)
        const color = getTeamColor(shot.teamId)
        
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
            `Period ${shot.period} - ${shot.time}`,
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
          onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(shot, e.clientX, e.clientY),
          onMouseLeave: handleMouseLeave,
        }

        if (shot.result === 'goal') {
          return (
            <GoalMarker
              key={`shot-${shot.eventId}-${idx}`}
              {...markerProps}
            />
          )
        } else if (shot.result === 'shot-on-goal') {
          return (
            <ShotMarker
              key={`shot-${shot.eventId}-${idx}`}
              {...markerProps}
            />
          )
        } else {
          // missed-shot or blocked-shot
          return (
            <MissedShotMarker
              key={`shot-${shot.eventId}-${idx}`}
              {...markerProps}
            />
          )
        }
      })}
    </g>
  )
}
