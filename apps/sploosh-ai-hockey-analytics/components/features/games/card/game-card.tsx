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
            <div className="px-4 pb-4 flex flex-col gap-1.5">
                {/* Teams and Scores */}
                <div className="flex items-center justify-center gap-1">
                    <div className="relative w-8 h-8">
                        <Image
                            src={getTeamLogoUrl(game.awayTeam.abbrev)}
                            alt={`${game.awayTeam.abbrev} logo`}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col items-center w-12">
                        <div>{game.awayTeam.abbrev}</div>
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {game.awayTeam.sog} SOG
                        </div>
                    </div>
                    <div className="flex gap-2 mx-1">
                        <span>{game.awayTeam.score}</span>
                        <span>-</span>
                        <span>{game.homeTeam.score}</span>
                    </div>
                    <div className="flex flex-col items-center w-12">
                        <div>{game.homeTeam.abbrev}</div>
                        <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                            {game.homeTeam.sog} SOG
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