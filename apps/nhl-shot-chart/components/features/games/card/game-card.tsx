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
    console.log(`Rendering GameCard for game: ${game.id} - Special Event: ${game.specialEvent?.name.default}`)
    if (game.id === 2024020592) {
        console.log(game)
    }

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
            className="rounded-lg bg-card px-6 py-4 shadow-sm cursor-pointer hover:bg-accent/50 transition-colors w-full"
            onClick={handleGameClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleGameClick({} as React.MouseEvent)
                }
            }}
        >
            <div className="flex flex-col gap-2">
                {/* Special Event (if present) */}
                {game.specialEvent && (
                    <div className="flex flex-col items-center gap-1 mb-2">
                        <div className="relative w-24 h-8">
                            <Image
                                src={game.specialEvent.lightLogoUrl.default}
                                alt={game.specialEvent.name.default}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="text-xs text-primary font-medium">
                            {game.specialEvent.name.default}
                        </span>
                    </div>
                )}

                {/* Teams and Scores */}
                <div className="flex items-center justify-center gap-4">
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
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-2">
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