import Image from 'next/image'
import { NHLEdgeGame } from '@/types/nhl-edge'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameCardProps {
    game: NHLEdgeGame
    onSelectGame?: (gameId: number) => void
    onClose?: () => void
}

export function GameCard({ game, onSelectGame, onClose }: GameCardProps) {
    const getTeamLogoUrl = (teamAbbrev: string) => {
        return `https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_light.svg`
    }

    const handleGameClick = (e: React.MouseEvent) => {
        if (onSelectGame) {
            onSelectGame(game.id)
            if (onClose) {
                onClose()
            }
            e.preventDefault()
            e.stopPropagation()
        }
    }

    const handleGameCenterClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const url = `https://www.nhl.com/gamecenter/${game.id}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    const getGameStatus = () => {
        switch (game.gameState) {
            case 'CRIT':
            case 'LIVE':
                if (game.clock?.inIntermission) {
                    return `INT${game.period} - ${game.clock?.timeRemaining}`
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
        switch (game.gameState) {
            case 'LIVE':
            case 'CRIT':
                return 'text-green-500 dark:text-green-400'
            case 'FINAL':
            case 'OFF':
                return 'text-gray-500 dark:text-gray-400'
            case 'PRE':
            case 'FUT':
                return 'text-muted-foreground'
            default:
                return 'text-muted-foreground'
        }
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

            <div className="px-6 pb-4 flex flex-col gap-1.5">
                {/* Teams and Scores */}
                <div className="flex items-center justify-center gap-4 mt-1">
                    {/* Away Team */}
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6">
                            <Image
                                src={getTeamLogoUrl(game.awayTeam.abbrev)}
                                alt={`${game.awayTeam.name} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-medium">{game.awayTeam.abbrev}</span>
                        {game.awayTeam.score !== undefined && (
                            <span className="font-medium">{game.awayTeam.score}</span>
                        )}
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-2">
                        {game.homeTeam.score !== undefined && (
                            <span className="font-medium">{game.homeTeam.score}</span>
                        )}
                        <span className="font-medium">{game.homeTeam.abbrev}</span>
                        <div className="relative w-6 h-6">
                            <Image
                                src={getTeamLogoUrl(game.homeTeam.abbrev)}
                                alt={`${game.homeTeam.name} logo`}
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