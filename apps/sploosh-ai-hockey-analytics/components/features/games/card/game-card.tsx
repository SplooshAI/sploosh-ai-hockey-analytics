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
                                src={getTeamLogoUrl(game.awayTeam.abbrev)}
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
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                {game.awayTeam.sog !== undefined && <span>{game.awayTeam.sog} SOG</span>}
                                {game.homeTeam.sog !== undefined && <span>{game.homeTeam.sog} SOG</span>}
                            </div>
                        </div>
                        <div className="relative w-8 h-8">
                            <Image
                                src={getTeamLogoUrl(game.homeTeam.abbrev)}
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