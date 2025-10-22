'use client'
import Image from 'next/image'
import { parseISO } from 'date-fns'
import { format, formatInTimeZone } from 'date-fns-tz'
import { ExternalLink, Tv } from 'lucide-react'

// Extended game data type that includes fields from both play-by-play and game center APIs
interface GameHeaderData {
  gameDate: string
  gameState: string
  startTimeUTC?: string
  awayTeam?: {
    abbrev: string
    logo?: string
    score?: number
    sog?: number
    record?: string
  }
  homeTeam?: {
    abbrev: string
    logo?: string
    score?: number
    sog?: number
    record?: string
  }
  clock?: {
    timeRemaining?: string
    inIntermission?: boolean
  }
  periodDescriptor?: {
    number: number
    periodType: string
  }
  period?: number
  venue?: {
    default?: string
  }
  specialEvent?: {
    name: {
      default: string
    }
    lightLogoUrl: {
      default: string
    }
  }
  gameOutcome?: {
    lastPeriodType?: string
  }
  gameCenterLink?: string
  tvBroadcasts?: Array<{
    id: number
    market: string
    countryCode: string
    network: string
    sequenceNumber: number
    logo?: string
  }>
  gameVideo?: {
    threeMinRecap?: string
    condensedGame?: string
  }
}

interface GameHeaderProps {
  gameData: GameHeaderData
  className?: string
  lastRefreshTime?: Date | null
}

/**
 * GameHeader - Reusable game information header
 * Displays team logos, scores, records, SOG, game state, and venue
 * Matches the sidebar game card styling
 */
export const GameHeader: React.FC<GameHeaderProps> = ({ gameData, className = '', lastRefreshTime }) => {
  const awayTeamName = gameData.awayTeam?.abbrev || 'Away'
  const homeTeamName = gameData.homeTeam?.abbrev || 'Home'
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Helper function to get the OT period display (OT, 2OT, 3OT, etc.)
  const getOTPeriodDisplay = (periodNumber: number) => {
    const otPeriodNum = periodNumber - 3
    return otPeriodNum > 1 ? `${otPeriodNum}OT` : 'OT'
  }

  const getOrdinalNum = (n: number) => {
    // Special case: 11, 12, 13 always end with "th"
    if (n % 100 >= 11 && n % 100 <= 13) {
      return n + 'th'
    }

    // All other numbers follow the simple pattern
    switch (n % 10) {
      case 1: return n + 'st'
      case 2: return n + 'nd'
      case 3: return n + 'rd'
      default: return n + 'th'
    }
  }

  const getGameStatus = () => {
    switch (gameData.gameState) {
      case 'CRIT':
      case 'LIVE':
        if (gameData.clock?.inIntermission) {
          if (gameData.periodDescriptor?.periodType === 'OT') {
            const otDisplay = getOTPeriodDisplay(gameData.periodDescriptor.number)
            return `${otDisplay} INT - ${gameData.clock?.timeRemaining}`
          } else if (gameData.periodDescriptor?.periodType === 'SO') {
            return `SO INT - ${gameData.clock?.timeRemaining}`
          } else {
            const ordinalPeriod = getOrdinalNum(gameData.periodDescriptor?.number || 1)
            return `${ordinalPeriod} INT - ${gameData.clock?.timeRemaining}`
          }
        }
        if (gameData.periodDescriptor) {
          if (gameData.periodDescriptor.periodType === 'OT') {
            const otDisplay = getOTPeriodDisplay(gameData.periodDescriptor.number)
            return `${otDisplay} - ${gameData.clock?.timeRemaining}`
          } else if (gameData.periodDescriptor.periodType === 'SO') {
            return `SO - ${gameData.clock?.timeRemaining}`
          } else {
            return `${getOrdinalNum(gameData.periodDescriptor.number)} Period - ${gameData.clock?.timeRemaining}`
          }
        }
        return `Period ${gameData.period} - ${gameData.clock?.timeRemaining}`
      case 'FUT':
      case 'PRE':
        if (gameData.startTimeUTC) {
          return formatInTimeZone(
            parseISO(gameData.startTimeUTC),
            Intl.DateTimeFormat().resolvedOptions().timeZone,
            'h:mm a zzz'
          )
        }
        return 'Scheduled'
      case 'FINAL':
      case 'OFF':
        if (gameData.periodDescriptor?.periodType === 'OT') {
          const otDisplay = getOTPeriodDisplay(gameData.periodDescriptor.number)
          return `Final (${otDisplay})`
        } else if (gameData.periodDescriptor?.periodType === 'SO') {
          return 'Final (SO)'
        }
        return 'Final'
      default:
        return gameData.gameState
    }
  }

  const getGameStateClass = () => {
    if (gameData.gameState === 'LIVE' || gameData.gameState === 'CRIT') {
      if (gameData.clock?.inIntermission) {
        return 'text-red-500'
      }
      return 'text-green-500'
    }
    return 'text-muted-foreground'
  }

  const formatGameDate = () => {
    // Use parseISO and format in UTC to avoid timezone conversion issues
    // gameDate is in YYYY-MM-DD format and should be displayed as-is
    if (!gameData.gameDate) return ''
    const date = parseISO(gameData.gameDate)
    const day = formatInTimeZone(date, 'UTC', 'd')
    const ordinalSuffix = getOrdinalNum(parseInt(day))
    const formattedDate = formatInTimeZone(date, 'UTC', 'EEEE, MMMM')
    return `${formattedDate} ${ordinalSuffix}, ${formatInTimeZone(date, 'UTC', 'yyyy')}`
  }

  const handleGameCenterClick = () => {
    if (gameData.gameCenterLink) {
      const baseUrl = 'https://www.nhl.com'
      window.open(`${baseUrl}${gameData.gameCenterLink}`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Special Event Banner */}
      {gameData.specialEvent?.lightLogoUrl?.default && (
        <div className="relative w-full h-16 bg-white rounded-md overflow-hidden">
          <Image
            src={gameData.specialEvent.lightLogoUrl.default}
            alt={gameData.specialEvent.name?.default || 'Special Event'}
            fill
            className="object-contain"
          />
        </div>
      )}

      {/* Teams and Score */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3">
          {/* Away Team Logo */}
          {gameData.awayTeam?.logo && (
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <Image
                src={gameData.awayTeam.logo}
                alt={awayTeamName}
                fill
                className="object-contain"
              />
            </div>
          )}

          {/* Score and Team Info */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg sm:text-xl">{awayTeamName}</span>
              <span className="text-3xl sm:text-4xl font-bold">{gameData.awayTeam?.score ?? 0}</span>
              <span className="text-2xl sm:text-3xl text-muted-foreground">-</span>
              <span className="text-3xl sm:text-4xl font-bold">{gameData.homeTeam?.score ?? 0}</span>
              <span className="font-bold text-lg sm:text-xl">{homeTeamName}</span>
            </div>

            {/* Records and SOG */}
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {gameData.awayTeam?.sog !== undefined && (
                  <span>{gameData.awayTeam.sog} SOG</span>
                )}
                {gameData.awayTeam?.record && (
                  <span>{gameData.awayTeam.record}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {gameData.homeTeam?.record && (
                  <span>{gameData.homeTeam.record}</span>
                )}
                {gameData.homeTeam?.sog !== undefined && (
                  <span>{gameData.homeTeam.sog} SOG</span>
                )}
              </div>
            </div>
          </div>

          {/* Home Team Logo */}
          {gameData.homeTeam?.logo && (
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <Image
                src={gameData.homeTeam.logo}
                alt={homeTeamName}
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Special Event Name */}
      {gameData.specialEvent && (
        <div className="text-sm text-muted-foreground text-center">
          {gameData.specialEvent.name.default}
        </div>
      )}

      {/* Game State - Color Coded */}
      <div className={`text-base sm:text-lg font-semibold text-center ${getGameStateClass()}`}>
        {getGameStatus()}
      </div>

      {/* Game Date and Venue */}
      <div className="text-center space-y-0.5">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {formatGameDate()}
        </div>
        <div className="text-xs text-muted-foreground">
          {gameData.venue?.default || 'Unknown Venue'}
        </div>
        {lastRefreshTime && (
          <div className="text-xs text-muted-foreground mt-1">
            Last updated @ {format(lastRefreshTime, 'h:mm:ss a zzz', { timeZone })}
          </div>
        )}
      </div>

      {/* Broadcast Information */}
      {gameData.tvBroadcasts && gameData.tvBroadcasts.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/30 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
            <Tv className="h-3.5 w-3.5" />
            <span>Watch On</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gameData.tvBroadcasts.map((broadcast, index) => (
              <span key={broadcast.id} className="text-foreground">
                {broadcast.network}
                {index < gameData.tvBroadcasts!.length - 1 && <span className="text-muted-foreground mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* NHL Game Center Link */}
      {gameData.gameCenterLink && (
        <div className="flex justify-center pt-1">
          <button
            onClick={handleGameCenterClick}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>NHL® Game Center</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
