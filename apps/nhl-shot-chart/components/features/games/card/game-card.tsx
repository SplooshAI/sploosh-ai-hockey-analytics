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
            <div className="flex flex-col gap-1">
                <div className="grid grid-cols-[24px_40px_24px_24px_40px_24px] items-center justify-center gap-2">
                    {/* Away Team Logo */}
                    <div className="relative w-6 h-6">
                        <Image
                            src={getTeamLogoUrl(game.awayTeam.abbrev)}
                            alt={`${game.awayTeam.name} logo`}
                            fill
                            className="object-contain"
                        />
                    </div>

                    {/* Away Team Abbreviation */}
                    <span className="font-medium text-right">{game.awayTeam.abbrev}</span>

                    {/* Scores */}
                    <span className="font-bold text-center">
                        {game.awayTeam.score !== undefined && game.awayTeam.score}
                    </span>

                    <span className="font-bold text-center">
                        {game.homeTeam.score !== undefined && game.homeTeam.score}
                    </span>

                    {/* Home Team Abbreviation */}
                    <span className="font-medium text-left">{game.homeTeam.abbrev}</span>

                    {/* Home Team Logo */}
                    <div className="relative w-6 h-6">
                        <Image
                            src={getTeamLogoUrl(game.homeTeam.abbrev)}
                            alt={`${game.homeTeam.name} logo`}
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className={`text-sm text-center ${getGameStateClass()}`}>
                    {getGameStatus()}
                </div>
            </div>

            <div className="flex justify-center gap-2 mt-2">
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