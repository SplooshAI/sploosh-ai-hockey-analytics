import Image from 'next/image'
import { NHLEdgeGame } from '@/types/nhl-edge'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameCardProps {
    game: NHLEdgeGame
}

export function GameCard({ game }: GameCardProps) {
    const getTeamLogoUrl = (teamAbbrev: string) => {
        return `https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_light.svg`
    }

    const handleGameClick = () => {
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
                // Game has ended but stats may still be getting finalized
                return 'Final'
            case 'OFF':
                // Game is official with all stats finalized
                return 'Final'

            // TODO: Add notification for an unexpected game state
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
            className="rounded-lg bg-card p-4 shadow-sm cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={handleGameClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleGameClick()
                }
            }}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image
                                src={getTeamLogoUrl(game.awayTeam.abbrev)}
                                alt={`${game.awayTeam.name} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <span className="font-medium">{game.awayTeam.abbrev}</span>
                        {game.awayTeam.score !== undefined && (
                            <span className="font-bold">{game.awayTeam.score}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {game.homeTeam.score !== undefined && (
                            <span className="font-bold">{game.homeTeam.score}</span>
                        )}
                        <span className="font-medium">{game.homeTeam.abbrev}</span>
                        <div className="relative w-8 h-8">
                            <Image
                                src={getTeamLogoUrl(game.homeTeam.abbrev)}
                                alt={`${game.homeTeam.name} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className={`text-sm text-center ${getGameStateClass()}`}>
                    {getGameStatus()}
                </div>
            </div>
        </div>
    )
} 