/**
 * Utility functions for parsing and transforming shot chart data from NHL EDGE API
 */

export interface ShotEvent {
  xCoord: number
  yCoord: number
  period: number
  teamId: number
  playerId?: number
  result: 'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'
  time: string
  shotType?: string
  zone?: string
  eventId: number
}

export interface TeamInfo {
  id: number
  name: string
  abbrev: string
  color: string
}

/**
 * Parse all shot events from NHL EDGE play-by-play data
 * @param gameJSON - Complete NHL EDGE game data
 * @returns Array of parsed shot events
 */
export function parseShotsFromEdge(gameJSON: any): ShotEvent[] {
  const plays = gameJSON.plays || []
  const relevantTypes = ['shot-on-goal', 'missed-shot', 'blocked-shot', 'goal']

  return plays
    .filter((ev: any) => relevantTypes.includes(ev.typeDescKey))
    .map((ev: any) => {
      const details = ev.details || {}
      return {
        xCoord: details.xCoord,
        yCoord: details.yCoord,
        period: ev.periodDescriptor?.number,
        teamId: details.eventOwnerTeamId,
        playerId: details.shootingPlayerId || details.scoringPlayerId,
        result: ev.typeDescKey === 'goal' ? 'goal' : ev.typeDescKey,
        time: ev.timeInPeriod,
        shotType: details.shotType,
        zone: details.zoneCode || '',
        eventId: ev.eventId,
      }
    })
    .filter((shot: ShotEvent) => 
      shot.xCoord !== undefined && 
      shot.yCoord !== undefined
    )
}

/**
 * Transform NHL EDGE coordinates to SVG rink coordinates
 * NHL EDGE uses a coordinate system where:
 * - x ranges from -100 to 100 (left to right)
 * - y ranges from -42.5 to 42.5 (bottom to top)
 * 
 * SVG rink viewBox is: -75 -75 2550 1170
 * Actual rink dimensions: 2400 x 1020
 * 
 * @param x - NHL EDGE x coordinate
 * @param y - NHL EDGE y coordinate
 * @returns SVG coordinates {cx, cy}
 */
export function transformCoordinates(x: number, y: number): { cx: number; cy: number } {
  // NHL EDGE coordinate system to SVG transformation
  // x: -100 to 100 maps to 0 to 2400
  // y: -42.5 to 42.5 maps to 0 to 1020 (inverted)
  
  const cx = ((x + 100) / 200) * 2400
  const cy = ((42.5 - y) / 85) * 1020  // Invert y-axis
  
  return { cx, cy }
}

/**
 * Get team colors based on team ID
 * Using official NHL team primary colors
 */
export function getTeamColor(teamId: number): string {
  const teamColors: Record<number, string> = {
    1: '#CE1126',   // New Jersey Devils
    2: '#00539B',   // New York Islanders
    3: '#0038A8',   // New York Rangers
    4: '#F47A38',   // Philadelphia Flyers
    5: '#FCB514',   // Pittsburgh Penguins
    6: '#FFB81C',   // Boston Bruins
    7: '#003087',   // Buffalo Sabres - Navy Blue
    8: '#C8102E',   // Montreal Canadiens
    9: '#C8102E',   // Ottawa Senators
    10: '#00205B',  // Toronto Maple Leafs
    12: '#041E42',  // Carolina Hurricanes
    13: '#B9975B',  // Florida Panthers - Gold
    14: '#041E42',  // Tampa Bay Lightning
    15: '#111111',  // Washington Capitals
    16: '#CF0A2C',  // Chicago Blackhawks
    17: '#CE1126',  // Detroit Red Wings
    18: '#041E42',  // Nashville Predators
    19: '#002F87',  // St. Louis Blues
    20: '#006847',  // Calgary Flames
    21: '#00205B',  // Colorado Avalanche
    22: '#154734',  // Edmonton Oilers
    23: '#8F8F8C',  // Vancouver Canucks
    24: '#B4975A',  // Anaheim Ducks
    25: '#010101',  // Dallas Stars
    26: '#35D0BA',  // Los Angeles Kings - Teal accent
    28: '#006272',  // San Jose Sharks
    29: '#154734',  // Columbus Blue Jackets
    30: '#154734',  // Minnesota Wild
    52: '#99D9D9',  // Winnipeg Jets - Light Blue
    53: '#006D75',  // Arizona Coyotes
    54: '#E4A010',  // Vegas Golden Knights
    55: '#001628',  // Seattle Kraken
  }
  
  return teamColors[teamId] || '#8B4789' // Purple as fallback
}

/**
 * Get player name from roster
 */
export function getPlayerName(playerId: number, rosterSpots: any[]): string {
  const player = rosterSpots.find((spot: any) => spot.playerId === playerId)
  if (!player) return 'Unknown'
  
  const firstName = player.firstName?.default || ''
  const lastName = player.lastName?.default || ''
  return `${firstName} ${lastName}`.trim()
}

/**
 * Filter shots by team
 */
export function filterShotsByTeam(shots: ShotEvent[], teamId?: number): ShotEvent[] {
  if (!teamId) return shots
  return shots.filter(shot => shot.teamId === teamId)
}

/**
 * Filter shots by period
 */
export function filterShotsByPeriod(shots: ShotEvent[], period?: number): ShotEvent[] {
  if (!period) return shots
  return shots.filter(shot => shot.period === period)
}

/**
 * Filter shots by result type
 */
export function filterShotsByResult(
  shots: ShotEvent[], 
  results?: Array<'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'>
): ShotEvent[] {
  if (!results) return shots
  if (results.length === 0) return [] // No filters selected = no shots shown
  return shots.filter(shot => results.includes(shot.result))
}
