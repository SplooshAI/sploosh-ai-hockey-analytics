import Image from 'next/image'
import { NHLEdgeGame, NHLEdgeTeam } from '@/lib/api/nhl-edge/types/nhl-edge'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameCardProps {
    game: NHLEdgeGame
    onSelectGame?: (gameId: number) => void
    onClose?: () => void
}

export function GameCard({ game, onSelectGame, onClose }: GameCardProps) {
    const getTeamLogoUrl = (team: NHLEdgeTeam) => {
        return team.logo || `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg`
    }

    const handleGameClick = (e: React.MouseEvent) => {
        if (onSelectGame) {
            onSelectGame(game.id)
            onClose?.()
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const handleGameCenterClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        const baseUrl = 'https://www.nhl.com'
        window.open(`${baseUrl}${game.gameCenterLink}`, '_blank')
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
                        return `OT INT - ${game.clock?.timeRemaining}`
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
                        return `OT - ${game.clock?.timeRemaining}`
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
                    Intl.DateTimeFormat().resolvedOptions().timeZone,
                    'h:mm a zzz'
                )
            case 'FINAL':
            case 'OFF':
                if (game.periodDescriptor?.periodType === 'OT') {
                    return 'Final (OT)'
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
            className="rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent/50 transition-colors w-full overflow-hidden"
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
            {game.specialEvent && (
                <div className="relative w-full h-16 bg-white">
                    <Image
                        src={game.specialEvent.lightLogoUrl.default}
                        alt={game.specialEvent.name.default}
                        fill
                        className="object-contain"
                    />
                </div>
            )}

            <div className="px-4 pb-4 flex flex-col gap-1.5">
                {/* Teams and Scores */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-1">
                        <div className="relative w-8 h-8">
                            <Image
                                src={getTeamLogoUrl(game.awayTeam)}
                                alt={`${game.awayTeam.abbrev} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <span>{game.awayTeam.abbrev}</span>
                                <span>{game.awayTeam.score}</span>
                                <span>-</span>
                                <span>{game.homeTeam.score}</span>
                                <span>{game.homeTeam.abbrev}</span>
                            </div>
                            {/* Additional game details row - add new stats here */}
                            <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
                                <div className="flex flex-col items-start gap-0.5">
                                    <div className="flex items-center gap-2">
                                        {game.awayTeam.sog !== undefined && <span className="min-w-[45px]">{game.awayTeam.sog} SOG</span>}
                                        <span>{game.awayTeam.record}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span>{game.homeTeam.record}</span>
                                        {game.homeTeam.sog !== undefined && <span className="min-w-[45px] text-right">{game.homeTeam.sog} SOG</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative w-8 h-8">
                            <Image
                                src={getTeamLogoUrl(game.homeTeam)}
                                alt={`${game.homeTeam.abbrev} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Special Event Name (if present) */}
                {game.specialEvent && (
                    <div className="text-xs text-muted-foreground text-center">
                        {game.specialEvent.name.default}
                    </div>
                )}

                {/* Game Status */}
                <div className={`text-sm text-center ${getGameStateClass()}`}>
                    {getGameStatus()}
                </div>

                {/* NHL Game Center Button */}
                <button
                    onClick={handleGameCenterClick}
                    className="text-xs px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                >
                    NHL Game Center
                </button>
            </div>
        </div>
    )
} 