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
        e.preventDefault()
        if (onSelectGame) {
            onSelectGame(game.id)
        }
    }

    const handleGameCenterClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        window.open(game.gameCenterLink, '_blank')
    }

    const getGameStatus = () => {
        if (game.gameState === 'FUT') {
            return formatInTimeZone(parseISO(game.startTimeUTC), 'America/New_York', 'h:mm a z')
        }

        if (game.gameState === 'LIVE') {
            if (game.period && game.clock) {
                return `${game.period}${getOrdinalNum(game.period)} - ${game.clock.timeRemaining}`
            }
        }

        if (game.gameState === 'OFF') {
            return 'Final'
        }

        return game.gameState
    }

    const getGameStateClass = () => {
        if (game.gameState === 'LIVE') {
            return 'text-red-500'
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
            <div className="px-6 pb-4 flex flex-col gap-1.5">
                {/* Teams and Scores */}
                <div className="flex items-center justify-center gap-4 mt-1">
                    {/* Away Team */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6">
                                <Image
                                    src={getTeamLogoUrl(game.awayTeam.abbrev)}
                                    alt={`${game.awayTeam.abbrev} logo`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-medium">{game.awayTeam.abbrev}</span>
                            {game.awayTeam.score !== undefined && (
                                <span className="font-medium">{game.awayTeam.score}</span>
                            )}
                        </div>
                        {game.awayTeam.sog !== undefined && (
                            <span className="text-xs text-muted-foreground">SOG: {game.awayTeam.sog}</span>
                        )}
                    </div>

                    {/* Home Team */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            {game.homeTeam.score !== undefined && (
                                <span className="font-medium">{game.homeTeam.score}</span>
                            )}
                            <span className="font-medium">{game.homeTeam.abbrev}</span>
                            <div className="relative w-6 h-6">
                                <Image
                                    src={getTeamLogoUrl(game.homeTeam.abbrev)}
                                    alt={`${game.homeTeam.abbrev} logo`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        {game.homeTeam.sog !== undefined && (
                            <span className="text-xs text-muted-foreground">SOG: {game.homeTeam.sog}</span>
                        )}
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