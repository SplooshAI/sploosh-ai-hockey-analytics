import Image from 'next/image'
import { NHLEdgeGame } from '@/types/nhl-edge'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameCardProps {
    game: NHLEdgeGame
}

export function GameCard({ game }: GameCardProps) {
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
                // Game has ended but stats may still be getting finalized or post-game reviews are happening
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

    const handleGameClick = () => {
        const url = `https://www.nhl.com/gamecenter/${game.id}`
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <div
            className="p-3 rounded-lg bg-background hover:bg-accent cursor-pointer"
            onClick={handleGameClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleGameClick()
                }
            }}
        >
            <div className="grid grid-cols-[1fr_40px] items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="team-logo">
                            <Image
                                src={`/path/to/team/logos/${game.awayTeam.abbrev}.png`}
                                alt={`${game.awayTeam.name} logo`}
                                width={32}
                                height={32}
                            />
                        </div>
                        <div className="text-sm font-medium">{game.awayTeam.abbrev}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="team-logo">
                            <Image
                                src={`/path/to/team/logos/${game.homeTeam.abbrev}.png`}
                                alt={`${game.homeTeam.name} logo`}
                                width={32}
                                height={32}
                            />
                        </div>
                        <div className="text-sm font-medium">{game.homeTeam.abbrev}</div>
                    </div>
                </div>
                <div className="text-lg font-bold">
                    <div className="text-right tabular-nums">{String(game.awayTeam.score ?? '-').trim()}</div>
                    <div className="text-right tabular-nums">{String(game.homeTeam.score ?? '-').trim()}</div>
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
                {getGameStatus()}
            </div>
        </div>
    )
} 