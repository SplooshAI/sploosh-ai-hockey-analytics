import { NHLGame } from '@/types/nhl'
import { parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

interface GameCardProps {
    game: NHLGame
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
                return 'Final'

            // TODO: Add notification for an unexpected game state
            default:
                return game.gameState
        }
    }

    return (
        <div className="p-3 rounded-lg bg-background hover:bg-accent cursor-pointer">
            <div className="grid grid-cols-[1fr_40px] items-center">
                <div className="space-y-1">
                    <div className="text-sm font-medium">{game.awayTeam.abbrev}</div>
                    <div className="text-sm font-medium">{game.homeTeam.abbrev}</div>
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