'use client'
import Image from 'next/image'
import { NHLEdgeGame, NHLEdgeTeam } from '@/lib/api/nhl-edge/types/nhl-edge'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { useSearchParams } from 'next/navigation'
import { specialGameBadge, specialEventTheme, needsGeneratedBanner } from '@/lib/utils/special-game'
import { SpecialEventBanner } from '@/components/shared/special-event-banner/special-event-banner'
import { formatVenueLine } from '@/lib/utils/venue-location'
import { SpecialGameBadge } from '@/components/shared/special-game-badge/special-game-badge'
import { Scorebug } from '@/components/features/game-header/scorebug'

interface GameCardProps {
    game: NHLEdgeGame
    onSelectGame?: (gameId: number) => void
    onClose?: () => void
}

export function GameCard({ game, onSelectGame, onClose }: GameCardProps) {
    const searchParams = useSearchParams()
    const timezone = (() => {
      const tz = searchParams.get('tz');
      if (!tz) return Intl.DateTimeFormat().resolvedOptions().timeZone;
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return tz;
      } catch {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
    })();
    const getTeamLogoUrl = (team: NHLEdgeTeam) => {
        return team.logo || `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg`
    }

    // Helper function to get the OT period display (OT, 2OT, 3OT, etc.)
    const getOTPeriodDisplay = (periodNumber: number) => {
        // Calculate OT period number (4th period is 1OT, 5th is 2OT, etc.)
        const otPeriodNum = periodNumber - 3;
        return otPeriodNum > 1 ? `${otPeriodNum}OT` : 'OT';
    }

    const handleGameClick = (e: React.MouseEvent) => {
        if (onSelectGame) {
            onSelectGame(game.id)
            onClose?.()
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const getOrdinalNum = (n: number) => {
        // Special case: 11, 12, 13 always end with "th"
        if (n % 100 >= 11 && n % 100 <= 13) {
            return n + 'th';
        }

        // All other numbers follow the simple pattern
        switch (n % 10) {
            case 1: return n + 'st';
            case 2: return n + 'nd';
            case 3: return n + 'rd';
            default: return n + 'th';
        }
    }

    const getGameStatus = () => {
        switch (game.gameState) {
            case 'CRIT':
            case 'LIVE':
                if (game.clock?.inIntermission) {
                    if (game.periodDescriptor?.periodType === 'OT') {
                        const otDisplay = getOTPeriodDisplay(game.periodDescriptor.number);
                        return `${otDisplay} INT - ${game.clock?.timeRemaining}`
                    } else if (game.periodDescriptor?.periodType === 'SO') {
                        return `SO INT - ${game.clock?.timeRemaining}`
                    } else {
                        const ordinalPeriod = game.periodDescriptor?.number === 1 ? '1st' :
                            game.periodDescriptor?.number === 2 ? '2nd' :
                                game.periodDescriptor?.number === 3 ? '3rd' : `${game.periodDescriptor?.number}th`;
                        return `${ordinalPeriod} INT - ${game.clock?.timeRemaining}`
                    }
                }
                if (game.periodDescriptor) {
                    if (game.periodDescriptor.periodType === 'OT') {
                        const otDisplay = getOTPeriodDisplay(game.periodDescriptor.number);
                        return `${otDisplay} - ${game.clock?.timeRemaining}`
                    } else if (game.periodDescriptor.periodType === 'SO') {
                        return `SO - ${game.clock?.timeRemaining}`
                    } else {
                        return `${getOrdinalNum(game.periodDescriptor.number)} Period - ${game.clock?.timeRemaining}`
                    }
                }
                return `Period ${game.period} - ${game.clock?.timeRemaining}`
            case 'FUT':
            case 'PRE':
                return formatInTimeZone(
                    parseISO(game.startTimeUTC),
                    timezone,
                    'h:mm a zzz'
                )
            case 'FINAL':
            case 'OFF':
                if (game.periodDescriptor?.periodType === 'OT') {
                    const otDisplay = getOTPeriodDisplay(game.periodDescriptor.number);
                    return `Final (${otDisplay})`
                } else if (game.periodDescriptor?.periodType === 'SO') {
                    return 'Final (SO)'
                }
                return 'Final'
            default:
                console.error(`Unexpected game state: ${game.gameState}`)
                return game.gameState
        }
    }

    const getGameStateClass = () => {
        if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
            if (game.clock?.inIntermission) {
                return 'text-red-500'
            }
            return 'text-green-500'
        }
        return 'text-muted-foreground'
    }

    return (
        <div
            className="rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent/50 active:bg-accent/70 transition-colors w-full overflow-hidden"
            onClick={handleGameClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleGameClick({} as React.MouseEvent)
                }
            }}
        >
            {/* Special Event Logo (if present) - Full width at top */}
            {game.specialEvent?.lightLogoUrl?.default && (
                <div className="relative w-full h-16 bg-white">
                    <Image
                        src={game.specialEvent.lightLogoUrl.default}
                        alt={game.specialEvent.name?.default || 'Special Event'}
                        fill
                        className="object-contain"
                    />
                </div>
            )}
            {needsGeneratedBanner(game) && (
                <SpecialEventBanner name={game.specialEvent!.name.default} theme={specialEventTheme(game)} />
            )}

            <div className="px-3 pb-3 pt-3 flex flex-col gap-1.5">
                {/* Scorebug: logos, scores, and status */}
                <Scorebug
                    compact
                    highlight={game.specialEvent?.name?.default ? specialEventTheme(game).accent : !!specialGameBadge(game)}
                    awayTeam={{ ...game.awayTeam, logo: getTeamLogoUrl(game.awayTeam) }}
                    homeTeam={{ ...game.homeTeam, logo: getTeamLogoUrl(game.homeTeam) }}
                    status={getGameStatus()}
                    statusClass={getGameStateClass()}
                    showSog={['LIVE', 'CRIT', 'FINAL', 'OFF'].includes(game.gameState)}
                />

                {/* Special event or neutral-site call-out, with the arena and where it is */}
                {specialGameBadge(game) && (
                    <div className="flex flex-col items-center gap-1">
                        {!needsGeneratedBanner(game) && <SpecialGameBadge label={specialGameBadge(game)} theme={game.specialEvent ? specialEventTheme(game) : undefined} />}
                        <div className="text-[11px] text-muted-foreground text-center">
                            {formatVenueLine(game.venue, game.venueLocation)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 