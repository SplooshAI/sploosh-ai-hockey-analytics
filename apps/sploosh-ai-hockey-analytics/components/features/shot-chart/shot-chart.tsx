/**
 * ShotChart - Complete shot chart visualization combining NHL rink and shot overlay
 * 
 * Displays all shots from a game on an NHL rink, with filtering options for:
 * - Team selection
 * - Period selection
 * - Shot type (goals, shots on goal, missed/blocked)
 * 
 * @example
 * <ShotChart gameData={playByPlayData} />
 */

'use client'

import * as React from 'react'
import { useMemo, useState } from 'react'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { ShotChartOverlay } from './shot-chart-overlay'
import {
  parseShotsFromEdge,
  filterShotsByTeam,
  filterShotsByPeriod,
  filterShotsByResult,
  getTeamColor,
  getPlayerName,
  transformCoordinates,
  type ShotEvent,
} from '@/lib/utils/shot-chart-utils'
import { ShotTooltip } from './shot-tooltip'

interface ShotChartProps {
  /** Complete NHL EDGE game data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameData: any
  /** Optional className for the container */
  className?: string
  /** Whether to show team names on the rink */
  showTeamNames?: boolean
  /** Whether to show the center ice logo */
  showCenterLogo?: boolean
  /** Center ice logo URL (defaults to NHL logo) */
  centerIceLogo?: string
}

interface ShotChartStats {
  totalShots: number
  goals: number
  shotsOnGoal: number
  missedShots: number
  blockedShots: number
}

/**
 * Calculate shot statistics
 */
function calculateStats(shots: ShotEvent[]): ShotChartStats {
  return {
    totalShots: shots.length,
    goals: shots.filter(s => s.result === 'goal').length,
    shotsOnGoal: shots.filter(s => s.result === 'shot-on-goal').length,
    missedShots: shots.filter(s => s.result === 'missed-shot').length,
    blockedShots: shots.filter(s => s.result === 'blocked-shot').length,
  }
}

export const ShotChart: React.FC<ShotChartProps> = ({
  gameData,
  className = '',
  showTeamNames = true,
  showCenterLogo = false,
  centerIceLogo,
}) => {
  // Parse all shots from game data
  const allShots = useMemo(() => parseShotsFromEdge(gameData), [gameData])
  
  // Load preferences from localStorage
  const loadPreferences = () => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('shotChartPreferences')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load shot chart preferences:', error)
      return null
    }
  }

  const savedPrefs = loadPreferences()
  
  // Filter state with localStorage defaults
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(undefined)
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(undefined)
  const [selectedResults, setSelectedResults] = useState<Array<'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'>>(
    savedPrefs?.selectedResults ?? [
      'goal',
      'shot-on-goal',
      'missed-shot',
      'blocked-shot',
    ]
  )
  const [markerScale, setMarkerScale] = useState(savedPrefs?.markerScale ?? 1.5)

  // Tooltip state
  const [hoveredShot, setHoveredShot] = useState<{
    shot: ShotEvent
    x: number
    y: number
    playerName: string
    teamLogo?: string
    playerHeadshot?: string
  } | null>(null)
  const [isTooltipHovered, setIsTooltipHovered] = useState(false)
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleShotHover = (shot: ShotEvent | null, clientX?: number, clientY?: number) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    if (!shot) {
      // On mobile, don't auto-hide - let user tap elsewhere to dismiss
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
      if (isMobile) {
        // Don't hide automatically on mobile
        return
      }
      // Desktop: delay hiding to allow moving to tooltip
      hideTimeoutRef.current = setTimeout(() => {
        if (!isTooltipHovered) {
          setHoveredShot(null)
        }
      }, 150)
      return
    }

    const playerName = shot.playerId 
      ? getPlayerName(shot.playerId, gameData.rosterSpots || [])
      : 'Unknown'
    
    // Get team logo
    const team = shot.teamId === gameData.awayTeam?.id 
      ? gameData.awayTeam 
      : gameData.homeTeam
    const teamLogo = team?.logo || team?.darkLogo
    
    // Get player headshot
    const player = (gameData.rosterSpots || []).find((spot: any) => spot.playerId === shot.playerId)
    const playerHeadshot = player?.headshot
    
    setHoveredShot({
      shot,
      x: clientX || 0,
      y: clientY || 0,
      playerName,
      teamLogo,
      playerHeadshot,
    })
  }

  const handleTooltipMouseEnter = () => {
    setIsTooltipHovered(true)
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false)
    setHoveredShot(null)
  }

  // Clear filters to defaults
  const handleClearFilters = () => {
    setSelectedTeam(undefined)
    setSelectedPeriod(undefined)
    setSelectedResults([]) // Clear all shot type selections
    setMarkerScale(1.5)
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('shotChartPreferences')
      } catch (error) {
        console.error('Failed to clear shot chart preferences:', error)
      }
    }
  }

  // Save preferences to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const preferences = {
        selectedResults,
        markerScale,
      }
      localStorage.setItem('shotChartPreferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save shot chart preferences:', error)
    }
  }, [selectedResults, markerScale])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  // Apply filters
  const filteredShots = useMemo(() => {
    let shots = allShots
    shots = filterShotsByTeam(shots, selectedTeam)
    shots = filterShotsByPeriod(shots, selectedPeriod)
    shots = filterShotsByResult(shots, selectedResults)
    return shots
  }, [allShots, selectedTeam, selectedPeriod, selectedResults])

  // Calculate statistics
  const stats = useMemo(() => calculateStats(filteredShots), [filteredShots])
  const awayStats = useMemo(() => 
    calculateStats(filterShotsByTeam(filteredShots, gameData.awayTeam?.id)),
    [filteredShots, gameData.awayTeam?.id]
  )
  const homeStats = useMemo(() => 
    calculateStats(filterShotsByTeam(filteredShots, gameData.homeTeam?.id)),
    [filteredShots, gameData.homeTeam?.id]
  )

  // Get team names
  const awayTeamName = gameData.awayTeam?.abbrev || 'Away'
  const homeTeamName = gameData.homeTeam?.abbrev || 'Home'

  // Get unique periods
  const periods = useMemo(() => {
    const periodSet = new Set(allShots.map(s => s.period))
    return Array.from(periodSet).sort((a, b) => a - b)
  }, [allShots])

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 sm:gap-4 md:items-center md:justify-between bg-muted/50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 sm:gap-4 md:items-center md:justify-center flex-1">
        {/* Team Filter */}
        <div className="flex gap-2 items-center w-full md:w-auto">
          <label className="text-sm font-medium">Team:</label>
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 md:flex-initial px-3 py-2 rounded-md border bg-background text-sm min-h-[44px] cursor-pointer"
          >
            <option value="">Both Teams</option>
            <option value={gameData.awayTeam?.id}>{awayTeamName}</option>
            <option value={gameData.homeTeam?.id}>{homeTeamName}</option>
          </select>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 items-center w-full md:w-auto">
          <label className="text-sm font-medium">Period:</label>
          <select
            value={selectedPeriod || ''}
            onChange={(e) => setSelectedPeriod(e.target.value ? Number(e.target.value) : undefined)}
            className="flex-1 md:flex-initial px-3 py-2 rounded-md border bg-background text-sm min-h-[44px] cursor-pointer"
          >
            <option value="">All Periods</option>
            {periods.map(p => (
              <option key={p} value={p}>Period {p}</option>
            ))}
          </select>
        </div>

        {/* Shot Type Filter */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center w-full md:w-auto">
          <label className="text-sm font-medium">Show:</label>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer py-2 px-1">
              <input
                type="checkbox"
                checked={selectedResults.includes('goal')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResults([...selectedResults, 'goal'])
                  } else {
                    setSelectedResults(selectedResults.filter(r => r !== 'goal'))
                  }
                }}
                className="rounded w-5 h-5 cursor-pointer"
              />
              Goals
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer py-2 px-1">
              <input
                type="checkbox"
                checked={selectedResults.includes('shot-on-goal')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResults([...selectedResults, 'shot-on-goal'])
                  } else {
                    setSelectedResults(selectedResults.filter(r => r !== 'shot-on-goal'))
                  }
                }}
                className="rounded w-5 h-5 cursor-pointer"
              />
              Shots
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer py-2 px-1">
              <input
                type="checkbox"
                checked={selectedResults.includes('missed-shot') || selectedResults.includes('blocked-shot')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedResults([...selectedResults, 'missed-shot', 'blocked-shot'])
                  } else {
                    setSelectedResults(selectedResults.filter(r => r !== 'missed-shot' && r !== 'blocked-shot'))
                  }
                }}
                className="rounded w-5 h-5 cursor-pointer"
              />
              Missed/Blocked
            </label>
          </div>
        </div>
        </div>

        {/* Marker Size Slider */}
        <div className="flex items-center gap-3 w-full md:min-w-[200px] md:w-auto py-2">
          <label className="text-sm font-medium whitespace-nowrap">Marker Size:</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={markerScale}
              onChange={(e) => setMarkerScale(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary touch-manipulation"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {markerScale.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="w-full md:w-auto px-4 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors whitespace-nowrap min-h-[44px] touch-manipulation"
          title="Clear all filters and reset to defaults"
        >
          Clear Filters
        </button>
      </div>

      {/* Shot Chart Visualization */}
      <div className="relative w-full">
        <div className="relative w-full">
          <NHLEdgeHockeyRink
            awayTeamName={showTeamNames ? awayTeamName : ''}
            homeTeamName={showTeamNames ? homeTeamName : ''}
            centerIceLogo={showCenterLogo ? centerIceLogo : undefined}
            centerIceLogoHeight={358}
            centerIceLogoWidth={400}
            className="w-full h-auto"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-75 -75 2550 1170"
            className="w-full h-auto absolute top-0 left-0 pointer-events-auto"
            onClick={(e) => {
              // Smart tap detection: find nearest marker if tap is close enough
              if (e.target === e.currentTarget || (e.target as SVGElement).tagName === 'rect') {
                const svg = e.currentTarget as SVGSVGElement
                const rect = svg.getBoundingClientRect()
                const viewBox = svg.viewBox.baseVal
                
                // Convert screen coordinates to SVG coordinates
                const scaleX = viewBox.width / rect.width
                const scaleY = viewBox.height / rect.height
                const svgX = (e.clientX - rect.left) * scaleX + viewBox.x
                const svgY = (e.clientY - rect.top) * scaleY + viewBox.y
                
                // Find nearest marker within 100 SVG units (≈75px on mobile)
                let nearestShot: ShotEvent | null = null
                let minDistance = 100 // Maximum search radius
                
                filteredShots.forEach(shot => {
                  const { cx, cy } = transformCoordinates(shot.xCoord, shot.yCoord)
                  const distance = Math.sqrt(Math.pow(svgX - cx, 2) + Math.pow(svgY - cy, 2))
                  
                  if (distance < minDistance) {
                    minDistance = distance
                    nearestShot = shot
                  }
                })
                
                if (nearestShot) {
                  // Found a nearby marker - show its tooltip
                  handleShotHover(nearestShot, e.clientX, e.clientY)
                } else {
                  // No nearby markers - dismiss tooltip
                  setHoveredShot(null)
                }
              }
            }}
          >
            {/* Background rect to capture clicks on empty space */}
            <rect
              x="-75"
              y="-75"
              width="2550"
              height="1170"
              fill="transparent"
              style={{ pointerEvents: 'all' }}
            />
            <ShotChartOverlay
              shots={filteredShots}
              rosterSpots={gameData.rosterSpots}
              gameData={gameData}
              showTooltips={true}
              onShotHover={handleShotHover}
              markerScale={markerScale}
              selectedShot={hoveredShot?.shot || null}
            />
          </svg>
        </div>
        
        {/* Render tooltip outside SVG */}
        {hoveredShot && (
          <div
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <ShotTooltip
              shot={hoveredShot.shot}
              playerName={hoveredShot.playerName}
              teamLogo={hoveredShot.teamLogo}
              playerHeadshot={hoveredShot.playerHeadshot}
              visible={true}
              x={hoveredShot.x}
              y={hoveredShot.y}
            />
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Away Team Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{awayTeamName}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Shots:</span>
              <span className="font-medium">{awayStats.totalShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Goals:</span>
              <span className="font-medium text-green-600">{awayStats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span>Shots on Goal:</span>
              <span className="font-medium">{awayStats.shotsOnGoal}</span>
            </div>
            <div className="flex justify-between">
              <span>Missed:</span>
              <span className="font-medium">{awayStats.missedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked:</span>
              <span className="font-medium">{awayStats.blockedShots}</span>
            </div>
          </div>
        </div>

        {/* Total Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Total</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Shots:</span>
              <span className="font-medium">{stats.totalShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Goals:</span>
              <span className="font-medium text-green-600">{stats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span>Shots on Goal:</span>
              <span className="font-medium">{stats.shotsOnGoal}</span>
            </div>
            <div className="flex justify-between">
              <span>Missed:</span>
              <span className="font-medium">{stats.missedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked:</span>
              <span className="font-medium">{stats.blockedShots}</span>
            </div>
          </div>
        </div>

        {/* Home Team Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{homeTeamName}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Shots:</span>
              <span className="font-medium">{homeStats.totalShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Goals:</span>
              <span className="font-medium text-green-600">{homeStats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span>Shots on Goal:</span>
              <span className="font-medium">{homeStats.shotsOnGoal}</span>
            </div>
            <div className="flex justify-between">
              <span>Missed:</span>
              <span className="font-medium">{homeStats.missedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked:</span>
              <span className="font-medium">{homeStats.blockedShots}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold text-base mb-3">Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Away Team Legend */}
          <div>
            <h4 className="font-medium text-sm mb-2">{awayTeamName}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon
                    points="16,6 18,13 25,13 19,17 21,24 16,20 11,24 13,17 7,13 14,13"
                    fill={getTeamColor(gameData.awayTeam?.id)}
                    stroke="#FFD700"
                    strokeWidth="2"
                  />
                </svg>
                <span>Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="8" 
                    fill={getTeamColor(gameData.awayTeam?.id)} 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                  />
                </svg>
                <span>Shot on Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <line 
                    x1="8" 
                    y1="8" 
                    x2="24" 
                    y2="24" 
                    stroke={getTeamColor(gameData.awayTeam?.id)} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                  <line 
                    x1="8" 
                    y1="24" 
                    x2="24" 
                    y2="8" 
                    stroke={getTeamColor(gameData.awayTeam?.id)} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
                <span>Missed/Blocked</span>
              </div>
            </div>
          </div>

          {/* Home Team Legend */}
          <div>
            <h4 className="font-medium text-sm mb-2">{homeTeamName}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <polygon
                    points="16,6 18,13 25,13 19,17 21,24 16,20 11,24 13,17 7,13 14,13"
                    fill={getTeamColor(gameData.homeTeam?.id)}
                    stroke="#FFD700"
                    strokeWidth="2"
                  />
                </svg>
                <span>Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="8" 
                    fill={getTeamColor(gameData.homeTeam?.id)} 
                    stroke="#FFFFFF" 
                    strokeWidth="2" 
                  />
                </svg>
                <span>Shot on Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <line 
                    x1="8" 
                    y1="8" 
                    x2="24" 
                    y2="24" 
                    stroke={getTeamColor(gameData.homeTeam?.id)} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                  <line 
                    x1="8" 
                    y1="24" 
                    x2="24" 
                    y2="8" 
                    stroke={getTeamColor(gameData.homeTeam?.id)} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
                <span>Missed/Blocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
