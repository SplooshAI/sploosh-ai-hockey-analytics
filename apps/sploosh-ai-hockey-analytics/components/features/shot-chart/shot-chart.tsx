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
import { VideoOverlay } from './video-overlay'
import {
  parseShotsFromEdge,
  filterShotsByTeam,
  filterShotsByPeriod,
  filterShotsByResult,
  getTeamColorWithContrast,
  getPlayerName,
  transformCoordinates,
  type ShotEvent,
} from '@/lib/utils/shot-chart-utils'
import { formatTeamFullName, formatPeriodLabel } from '@/lib/utils/formatters'
import { ShotTooltip } from './shot-tooltip'

interface ShotChartProps {
  /** Complete NHL EDGE game data */
   
  gameData: any
  /** Optional className for the container */
  className?: string
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
    teamName?: string
    teamAbbrev?: string
    teamColor?: string
    playerHeadshot?: string
    assistNames?: string[]
    goalieInNetName?: string
  } | null>(null)
  const [isTooltipHovered, setIsTooltipHovered] = useState(false)
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Video overlay state
  const [videoOverlay, setVideoOverlay] = useState<{
    url: string
    playerName: string
    teamAbbrev?: string
  } | null>(null)

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
    
    // Get team information
    const team = shot.teamId === gameData.awayTeam?.id 
      ? gameData.awayTeam 
      : gameData.homeTeam
    const teamLogo = team?.logo || team?.darkLogo
    const teamName = team?.name?.default || team?.commonName?.default
    const teamAbbrev = team?.abbrev
    const teamColor = getTeamColorWithContrast(
      gameData.homeTeam?.id,
      gameData.awayTeam?.id,
      shot.teamId
    )
    
    // Get player headshot
    const player = (gameData.rosterSpots || []).find((spot: any) => spot.playerId === shot.playerId)
    const playerHeadshot = player?.headshot
    
    // Get assist names for goals
    const assistNames = shot.assists?.map(assist => 
      getPlayerName(assist.playerId, gameData.rosterSpots || [])
    ).filter(name => name !== 'Unknown')
    
    // Get goalie name
    const goalieInNetName = shot.goalieInNetId 
      ? getPlayerName(shot.goalieInNetId, gameData.rosterSpots || [])
      : undefined
    
    setHoveredShot({
      shot,
      x: clientX || 0,
      y: clientY || 0,
      playerName,
      teamLogo,
      teamName,
      teamAbbrev,
      teamColor,
      playerHeadshot,
      assistNames,
      goalieInNetName,
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

  // Apply filters for display (includes result type filter)
  const filteredShots = useMemo(() => {
    let shots = allShots
    shots = filterShotsByTeam(shots, selectedTeam)
    shots = filterShotsByPeriod(shots, selectedPeriod)
    shots = filterShotsByResult(shots, selectedResults)
    return shots
  }, [allShots, selectedTeam, selectedPeriod, selectedResults])

  // Apply filters for stats (excludes result type filter so stats show all shot types)
  const shotsForStats = useMemo(() => {
    let shots = allShots
    shots = filterShotsByTeam(shots, selectedTeam)
    shots = filterShotsByPeriod(shots, selectedPeriod)
    // Don't filter by result type for stats
    return shots
  }, [allShots, selectedTeam, selectedPeriod])

  // Calculate statistics from all shot types (not filtered by result)
  const _stats = useMemo(() => calculateStats(shotsForStats), [shotsForStats])
  
  // Check if any filters are active that affect stats (team or period filters)
  // Result type filter is excluded since stats now show all shot types regardless
  const hasActiveFilters = selectedTeam !== undefined || selectedPeriod !== undefined
  
  const awayStats = useMemo(() => {
    const calculated = calculateStats(filterShotsByTeam(shotsForStats, gameData.awayTeam?.id))
    // Use official SOG from API only when no filters are applied, otherwise use calculated value
    // This ensures SOG updates correctly when filtering by period, team, or shot type
    return {
      ...calculated,
      shotsOnGoal: !hasActiveFilters && gameData.awayTeam?.sog !== undefined 
        ? gameData.awayTeam.sog 
        : calculated.shotsOnGoal
    }
  }, [shotsForStats, gameData.awayTeam?.id, gameData.awayTeam?.sog, hasActiveFilters])
  
  const homeStats = useMemo(() => {
    const calculated = calculateStats(filterShotsByTeam(shotsForStats, gameData.homeTeam?.id))
    // Use official SOG from API only when no filters are applied, otherwise use calculated value
    // This ensures SOG updates correctly when filtering by period, team, or shot type
    return {
      ...calculated,
      shotsOnGoal: !hasActiveFilters && gameData.homeTeam?.sog !== undefined 
        ? gameData.homeTeam.sog 
        : calculated.shotsOnGoal
    }
  }, [shotsForStats, gameData.homeTeam, hasActiveFilters])

  // Get team names
  const awayTeamName = gameData.awayTeam ? formatTeamFullName(gameData.awayTeam) : 'Away'
  const homeTeamName = gameData.homeTeam ? formatTeamFullName(gameData.homeTeam) : 'Home'

  // Get unique periods
  const periods = useMemo(() => {
    const periodSet = new Set(allShots.map(s => s.period))
    return Array.from(periodSet).sort((a, b) => a - b)
  }, [allShots])

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Filters and Legend */}
      <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Filter Controls */}
          <div className="flex flex-col gap-3 flex-1">
            {/* Row 1: Team and Period Filters */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              {/* Team Filter */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium whitespace-nowrap">Team:</label>
                <select
                  value={selectedTeam || ''}
                  onChange={(e) => setSelectedTeam(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1.5 rounded-md border bg-background text-sm cursor-pointer"
                >
                  <option value="">Both Teams</option>
                  <option value={gameData.awayTeam?.id}>{awayTeamName}</option>
                  <option value={gameData.homeTeam?.id}>{homeTeamName}</option>
                </select>
              </div>

              {/* Period Filter */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium whitespace-nowrap">Period:</label>
                <select
                  value={selectedPeriod || ''}
                  onChange={(e) => setSelectedPeriod(e.target.value ? Number(e.target.value) : undefined)}
                  className="px-3 py-1.5 rounded-md border bg-background text-sm cursor-pointer"
                >
                  <option value="">All Periods</option>
                  {periods.map(period => (
                    <option key={period} value={period}>
                      {formatPeriodLabel(period)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Show Checkboxes */}
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <label className="text-sm font-medium whitespace-nowrap">Show:</label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
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
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Goals
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
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
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Shots
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
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
                  className="rounded w-4 h-4 cursor-pointer"
                />
                Miss/Block
              </label>
            </div>

            {/* Row 3: Marker Size and Clear Button */}
            <div className="flex flex-wrap gap-3 items-center text-sm">
              {/* Marker Size Slider */}
              <div className="flex items-center gap-2 min-w-[180px] flex-1 max-w-[280px]">
                <label className="text-sm font-medium whitespace-nowrap">Marker Size:</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={markerScale}
                  onChange={(e) => setMarkerScale(Number(e.target.value))}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                  {markerScale.toFixed(1)}x
                </span>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors whitespace-nowrap"
                title="Clear all filters and reset to defaults"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Legend - Right Side on Desktop, Below on Mobile */}
          <div className="flex items-center justify-center lg:justify-end lg:border-l lg:border-border/50 lg:pl-6">
            <div className="flex flex-col gap-2 text-xs">
              {/* Away Team */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[3ch]">{gameData.awayTeam?.abbrev || 'Away'}:</span>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <polygon
                      points="16,6 18,13 25,13 19,17 21,24 16,20 11,24 13,17 7,13 14,13"
                      fill={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.awayTeam?.id)}
                      stroke="#FFD700"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="8" 
                      fill={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.awayTeam?.id)} 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                    />
                  </svg>
                  <span>Shot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <line 
                      x1="8" 
                      y1="8" 
                      x2="24" 
                      y2="24" 
                      stroke={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.awayTeam?.id)} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                    <line 
                      x1="8" 
                      y1="24" 
                      x2="24" 
                      y2="8" 
                      stroke={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.awayTeam?.id)} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span>Miss/Block</span>
                </div>
              </div>

              {/* Home Team */}
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground min-w-[3ch]">{gameData.homeTeam?.abbrev || 'Home'}:</span>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <polygon
                      points="16,6 18,13 25,13 19,17 21,24 16,20 11,24 13,17 7,13 14,13"
                      fill={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.homeTeam?.id)}
                      stroke="#FFD700"
                      strokeWidth="2"
                    />
                  </svg>
                  <span>Goal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="8" 
                      fill={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.homeTeam?.id)} 
                      stroke="#FFFFFF" 
                      strokeWidth="2" 
                    />
                  </svg>
                  <span>Shot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 32 32" className="flex-shrink-0">
                    <line 
                      x1="8" 
                      y1="8" 
                      x2="24" 
                      y2="24" 
                      stroke={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.homeTeam?.id)} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                    <line 
                      x1="8" 
                      y1="24" 
                      x2="24" 
                      y2="8" 
                      stroke={getTeamColorWithContrast(gameData.homeTeam?.id, gameData.awayTeam?.id, gameData.homeTeam?.id)} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span>Miss/Block</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shot Chart Visualization */}
      <div className="relative w-full">
        <div className="relative w-full">
          <NHLEdgeHockeyRink
            centerIceLogo={showCenterLogo ? centerIceLogo : undefined}
            centerIceLogoHeight={358}
            centerIceLogoWidth={400}
            className="w-full h-auto"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-75 -75 2550 1170"
            className="w-full h-auto absolute top-0 left-0 pointer-events-none"
            onClick={(e) => {
              // Smart tap detection: find nearest marker if tap is close enough
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
          <ShotTooltip
            shot={hoveredShot.shot}
            playerName={hoveredShot.playerName}
            teamLogo={hoveredShot.teamLogo}
            teamName={hoveredShot.teamName}
            teamAbbrev={hoveredShot.teamAbbrev}
            teamColor={hoveredShot.teamColor}
            playerHeadshot={hoveredShot.playerHeadshot}
            assistNames={hoveredShot.assistNames}
            goalieInNetName={hoveredShot.goalieInNetName}
            gameData={gameData}
            onWatchReplay={() => {
              if (hoveredShot.shot.highlightClipId) {
                // Construct NHL embed URL from clip ID
                const embedUrl = `https://players.brightcove.net/6415718365001/EXtG1xJ7H_default/index.html?videoId=${hoveredShot.shot.highlightClipId}`
                setVideoOverlay({
                  url: embedUrl,
                  playerName: hoveredShot.playerName,
                  teamAbbrev: hoveredShot.teamAbbrev,
                })
              }
            }}
            visible={true}
            x={hoveredShot.x}
            y={hoveredShot.y}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            onDismiss={() => setHoveredShot(null)}
          />
        )}
        
        {/* Video Overlay */}
        {videoOverlay && (
          <VideoOverlay
            videoUrl={videoOverlay.url}
            playerName={videoOverlay.playerName}
            teamAbbrev={videoOverlay.teamAbbrev}
            onClose={() => setVideoOverlay(null)}
          />
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Away Team Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            {gameData.awayTeam?.logo && (
              <img 
                src={gameData.awayTeam.logo} 
                alt={`${awayTeamName} logo`}
                className="w-8 h-8 object-contain"
              />
            )}
            <h3 className="font-semibold text-lg">{awayTeamName}</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Goals</span>
              <span className="font-medium text-green-600 text-right min-w-[3ch] tabular-nums">{awayStats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span>Shots on Goal</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{awayStats.shotsOnGoal}</span>
            </div>
            <div className="border-t border-border my-2"></div>
            <div className="flex justify-between">
              <span>Missed Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{awayStats.missedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{awayStats.blockedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{awayStats.totalShots}</span>
            </div>
          </div>
        </div>

        {/* Home Team Stats */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            {gameData.homeTeam?.logo && (
              <img 
                src={gameData.homeTeam.logo} 
                alt={`${homeTeamName} logo`}
                className="w-8 h-8 object-contain"
              />
            )}
            <h3 className="font-semibold text-lg">{homeTeamName}</h3>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Goals</span>
              <span className="font-medium text-green-600 text-right min-w-[3ch] tabular-nums">{homeStats.goals}</span>
            </div>
            <div className="flex justify-between">
              <span>Shots on Goal</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{homeStats.shotsOnGoal}</span>
            </div>
            <div className="border-t border-border my-2"></div>
            <div className="flex justify-between">
              <span>Missed Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{homeStats.missedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Blocked Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{homeStats.blockedShots}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Shots</span>
              <span className="font-medium text-right min-w-[3ch] tabular-nums">{homeStats.totalShots}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
