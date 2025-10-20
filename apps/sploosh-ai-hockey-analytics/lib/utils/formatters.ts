/**
 * Formatting utilities for NHL data
 * 
 * This module provides consistent formatting for team names, periods, and other NHL-specific data.
 */

import { NHLEdgeTeam } from '@/lib/api/nhl-edge/types/nhl-edge'

/**
 * Format a team's full name (e.g., "Seattle Kraken", "Ottawa Senators")
 * 
 * @param team - The NHL Edge team object
 * @returns The full team name combining place name and common name
 * 
 * @example
 * formatTeamFullName(team) // "Seattle Kraken"
 */
export function formatTeamFullName(team: NHLEdgeTeam | { placeName: { default: string }, commonName: { default: string } }): string {
  return `${team.placeName.default} ${team.commonName.default}`
}

/**
 * Format a team's abbreviated name (e.g., "SEA", "OTT")
 * 
 * @param team - The NHL Edge team object
 * @returns The team's abbreviation
 * 
 * @example
 * formatTeamAbbrev(team) // "SEA"
 */
export function formatTeamAbbrev(team: { abbrev: string }): string {
  return team.abbrev
}

/**
 * Format a period number to its display label
 * 
 * @param period - The period number (1-3 for regulation, 4+ for overtime/shootout)
 * @returns The formatted period label
 * 
 * @example
 * formatPeriodLabel(1) // "1st"
 * formatPeriodLabel(2) // "2nd"
 * formatPeriodLabel(3) // "3rd"
 * formatPeriodLabel(4) // "OT"
 * formatPeriodLabel(5) // "SO"
 */
export function formatPeriodLabel(period: number): string {
  // Regulation periods
  if (period === 1) return '1st'
  if (period === 2) return '2nd'
  if (period === 3) return '3rd'
  
  // Overtime
  if (period === 4) return 'OT'
  
  // Shootout
  if (period === 5) return 'SO'
  
  // Multiple overtimes (rare, but possible in playoffs)
  if (period > 5) {
    const overtimeNumber = period - 4
    return `${overtimeNumber}OT`
  }
  
  // Fallback for unexpected values
  return `Period ${period}`
}

/**
 * Format a period number to its full description
 * 
 * @param period - The period number
 * @returns The full period description
 * 
 * @example
 * formatPeriodDescription(1) // "1st Period"
 * formatPeriodDescription(4) // "Overtime"
 * formatPeriodDescription(5) // "Shootout"
 */
export function formatPeriodDescription(period: number): string {
  if (period === 1) return '1st Period'
  if (period === 2) return '2nd Period'
  if (period === 3) return '3rd Period'
  if (period === 4) return 'Overtime'
  if (period === 5) return 'Shootout'
  
  if (period > 5) {
    const overtimeNumber = period - 4
    return `${overtimeNumber}${getOrdinalSuffix(overtimeNumber)} Overtime`
  }
  
  return `Period ${period}`
}

/**
 * Get the ordinal suffix for a number (st, nd, rd, th)
 * 
 * @param num - The number to get the suffix for
 * @returns The ordinal suffix
 * 
 * @example
 * getOrdinalSuffix(1) // "st"
 * getOrdinalSuffix(2) // "nd"
 * getOrdinalSuffix(3) // "rd"
 * getOrdinalSuffix(4) // "th"
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  
  if (j === 1 && k !== 11) return 'st'
  if (j === 2 && k !== 12) return 'nd'
  if (j === 3 && k !== 13) return 'rd'
  
  return 'th'
}

/**
 * Format game time for display - returns elapsed and remaining time separately
 * 
 * @param period - The period number
 * @param timeInPeriod - Time elapsed in period (MM:SS format)
 * @param timeRemaining - Time remaining in period (MM:SS format)
 * @returns Object with elapsed and remaining time, or single string for backward compatibility
 * 
 * @example
 * formatGameTime(1, '05:30', '14:30') // { elapsed: "5:30", remaining: "14:30 remaining" }
 * formatGameTime(4, '02:15', '02:45') // { elapsed: "2:15", remaining: "2:45 remaining" }
 * formatGameTime(5, '00:00', '00:00') // { elapsed: "0:00", remaining: null }
 */
export function formatGameTime(period: number, timeInPeriod?: string, timeRemaining?: string): { elapsed: string; remaining: string | null } {
  const elapsed = timeInPeriod || '0:00'
  
  // For shootout (period 5), only show time elapsed (no time remaining)
  if (period === 5) {
    return { elapsed, remaining: null }
  }
  
  // For regulation and overtime, return both elapsed and remaining
  if (timeRemaining) {
    return { elapsed, remaining: `${timeRemaining} remaining` }
  }
  
  return { elapsed, remaining: null }
}
