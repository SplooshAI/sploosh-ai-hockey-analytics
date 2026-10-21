/**
 * Utility functions for parsing and transforming shot chart data from NHL EDGE API
 */

/**
 * Check if a game has location data (coordinates) for shot events
 * Games before ~2007 typically don't have xCoord/yCoord data
 */
export function hasLocationData(gameData: any): boolean {
  const plays = gameData?.plays || []
  const shotEvents = plays.filter((play: any) => 
    ['shot-on-goal', 'missed-shot', 'blocked-shot', 'goal'].includes(play.typeDescKey)
  )
  
  // Check if any shot events have coordinate data
  return shotEvents.some((play: any) => 
    play.details?.xCoord !== undefined && play.details?.yCoord !== undefined
  )
}

export interface ShotEvent {
  xCoord: number
  yCoord: number
  period: number
  teamId: number
  playerId?: number
  result: 'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'
  time: string
  timeRemaining?: string
  shotType?: string
  zone?: string
  eventId: number
  situationCode?: string
  distance?: number
  angle?: number
  assists?: Array<{ playerId: number; assistType: string }>
  goalieInNetId?: number
  highlightClipId?: number
}

export interface TeamInfo {
  id: number
  name: string
  abbrev: string
  color: string
}

/**
 * Calculate shot distance from coordinates to center of net
 * NHL rink coordinates: x ranges from -100 to 100, y ranges from -42.5 to 42.5
 * Net is at x = 89 (offensive zone) or x = -89 (defensive zone)
 * 
 * @param x - X coordinate of shot
 * @param y - Y coordinate of shot
 * @returns Distance in feet
 */
function calculateShotDistance(x: number, y: number): number {
  // Determine which net the shot is towards (shots are always towards opponent's net)
  // Positive x values are shots towards the right net (x = 89)
  // Negative x values would be towards the left net (x = -89)
  const netX = x > 0 ? 89 : -89
  const netY = 0 // Center of net
  
  // Calculate Euclidean distance
  const distance = Math.sqrt(Math.pow(x - netX, 2) + Math.pow(y - netY, 2))
  
  // Round to 1 decimal place
  return Math.round(distance * 10) / 10
}

/**
 * Calculate shot angle from coordinates to net
 * Angle is measured from the goal line (0° = directly in front, 90° = from the boards)
 * 
 * @param x - X coordinate of shot
 * @param y - Y coordinate of shot
 * @returns Angle in degrees (0-90)
 */
function calculateShotAngle(x: number, y: number): number {
  // Determine which net the shot is towards
  const netX = x > 0 ? 89 : -89
  const netY = 0
  
  // Calculate angle using arctangent
  // Angle from center of net to shot location
  const angleRad = Math.atan2(Math.abs(y - netY), Math.abs(netX - x))
  const angleDeg = angleRad * (180 / Math.PI)
  
  // Round to 1 decimal place
  return Math.round(angleDeg * 10) / 10
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
      const xCoord = details.xCoord
      const yCoord = details.yCoord
      
      return {
        xCoord,
        yCoord,
        period: ev.periodDescriptor?.number,
        teamId: details.eventOwnerTeamId,
        playerId: details.shootingPlayerId || details.scoringPlayerId,
        result: ev.typeDescKey === 'goal' ? 'goal' : ev.typeDescKey,
        time: ev.timeInPeriod,
        timeRemaining: ev.timeRemaining,
        shotType: details.shotType,
        zone: details.zoneCode || '',
        eventId: ev.eventId,
        situationCode: ev.situationCode,
        distance: xCoord !== undefined && yCoord !== undefined ? calculateShotDistance(xCoord, yCoord) : undefined,
        angle: xCoord !== undefined && yCoord !== undefined ? calculateShotAngle(xCoord, yCoord) : undefined,
        assists: details.assist1PlayerId ? [
          { playerId: details.assist1PlayerId, assistType: 'primary' },
          ...(details.assist2PlayerId ? [{ playerId: details.assist2PlayerId, assistType: 'secondary' }] : [])
        ] : undefined,
        goalieInNetId: details.goalieInNetId,
        highlightClipId: details.highlightClip,
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
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const normalized = val / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
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
 * Alternative colors for teams when primary colors have poor contrast
 */
const teamAlternateColors: Record<number, string> = {
  10: '#5DADE2',  // Toronto Maple Leafs - Lighter blue for better contrast
  55: '#99D9D9',  // Seattle Kraken - Teal/cyan for better contrast
  21: '#6BAED6',  // Colorado Avalanche - Lighter blue
  7: '#4A90E2',   // Buffalo Sabres - Lighter blue
  14: '#5DADE2',  // Tampa Bay Lightning - Lighter blue
  12: '#E74C3C',  // Carolina Hurricanes - Red accent
  18: '#F4D03F',  // Nashville Predators - Gold accent
}

/**
 * Get team colors with automatic contrast adjustment
 * If two teams have similar colors (poor contrast), one team will use an alternate color
 * @param homeTeamId - Home team ID
 * @param awayTeamId - Away team ID
 * @param requestedTeamId - The team ID to get the color for
 * @returns Color string for the requested team
 */
export function getTeamColorWithContrast(
  homeTeamId: number,
  awayTeamId: number,
  requestedTeamId: number
): string {
  const homeColor = getTeamColor(homeTeamId)
  const awayColor = getTeamColor(awayTeamId)
  
  // Calculate contrast ratio between the two teams
  const contrastRatio = getContrastRatio(homeColor, awayColor)
  
  // WCAG AA standard requires 3:1 for large text/graphics
  // We'll use 2.5:1 as threshold since shot markers are relatively large
  const CONTRAST_THRESHOLD = 2.5
  
  if (contrastRatio < CONTRAST_THRESHOLD) {
    // Poor contrast detected - use alternate color for away team
    if (requestedTeamId === awayTeamId && teamAlternateColors[awayTeamId]) {
      return teamAlternateColors[awayTeamId]
    }
    // If away team doesn't have alternate, try home team alternate
    if (requestedTeamId === homeTeamId && teamAlternateColors[homeTeamId]) {
      return teamAlternateColors[homeTeamId]
    }
  }
  
  // Good contrast or no alternate available - use primary color
  return getTeamColor(requestedTeamId)
}

/**
 * Standardized color scheme for shot markers
 * Provides clear visual distinction regardless of team colors
 */
const STANDARD_COLORS = {
  home: {
    goal: '#2E7D32',        // Dark green
    shotOnGoal: '#1976D2',  // Blue
    missed: '#757575',      // Gray
  },
  away: {
    goal: '#C62828',        // Dark red
    shotOnGoal: '#F57C00',  // Orange
    missed: '#424242',      // Dark gray
  }
}

/**
 * Get standardized color based on home/away status and shot result
 * This provides consistent, high-contrast colors regardless of team colors
 * @param homeTeamId - Home team ID
 * @param shotTeamId - Team ID of the shot
 * @param shotResult - Result of the shot
 * @returns Color string
 */
export function getStandardizedShotColor(
  homeTeamId: number,
  shotTeamId: number,
  shotResult: 'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'
): string {
  const isHomeTeam = shotTeamId === homeTeamId
  const colorSet = isHomeTeam ? STANDARD_COLORS.home : STANDARD_COLORS.away
  
  if (shotResult === 'goal') {
    return colorSet.goal
  } else if (shotResult === 'shot-on-goal') {
    return colorSet.shotOnGoal
  } else {
    // missed-shot or blocked-shot
    return colorSet.missed
  }
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
