'use client'

import * as React from 'react'
import { formatTeamFullName } from '@/lib/utils/formatters'
import { filterShotsByTeam, type ShotEvent } from '@/lib/utils/shot-chart-utils'

interface ShotChartStats {
  totalShots: number
  goals: number
  shotsOnGoal: number
  missedShots: number
  blockedShots: number
}

/**
 * Calculate shot statistics - shared between 2D and 3D views
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

interface ShotStatisticsProps {
  gameData: any
  shotsForStats: ShotEvent[]
  hasActiveFilters: boolean
  className?: string
}

export function ShotStatistics({ gameData, shotsForStats, hasActiveFilters, className = "grid grid-cols-1 md:grid-cols-2 gap-4" }: ShotStatisticsProps) {
  const awayTeamName = gameData.awayTeam ? formatTeamFullName(gameData.awayTeam) : 'Away'
  const homeTeamName = gameData.homeTeam ? formatTeamFullName(gameData.homeTeam) : 'Home'

  const awayStats = React.useMemo(() => {
    const calculated = calculateStats(filterShotsByTeam(shotsForStats, gameData.awayTeam?.id))
    // Use official SOG from API only when no filters are applied, otherwise use calculated value
    return {
      ...calculated,
      shotsOnGoal: !hasActiveFilters && gameData.awayTeam?.sog !== undefined 
        ? gameData.awayTeam.sog 
        : calculated.shotsOnGoal
    }
  }, [shotsForStats, gameData.awayTeam, hasActiveFilters])

  const homeStats = React.useMemo(() => {
    const calculated = calculateStats(filterShotsByTeam(shotsForStats, gameData.homeTeam?.id))
    // Use official SOG from API only when no filters are applied, otherwise use calculated value
    return {
      ...calculated,
      shotsOnGoal: !hasActiveFilters && gameData.homeTeam?.sog !== undefined 
        ? gameData.homeTeam.sog 
        : calculated.shotsOnGoal
    }
  }, [shotsForStats, gameData.homeTeam, hasActiveFilters])

  return (
    <div className={className}>
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
  )
}
