'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { GameCard } from './game-card'
import { NHLScheduleResponse, NHLGame } from '@/types/nhl'

interface GamesListProps {
    date: Date
}

export function GamesList({ date }: GamesListProps) {
    const [scheduleData, setScheduleData] = useState<NHLScheduleResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchGames() {
            try {
                setLoading(true)
                const formattedDate = format(date, 'yyyy-MM-dd')
                const response = await fetch(`/api/nhl/scores?date=${formattedDate}`)

                if (!response.ok) {
                    throw new Error('Failed to fetch games')
                }

                const data: NHLScheduleResponse = await response.json()
                setScheduleData(data)
            } catch (err) {
                console.error('Error fetching games:', err)
                setError('Failed to load games')
            } finally {
                setLoading(false)
            }
        }

        fetchGames()
    }, [date])

    if (loading) return (
        <div className="flex justify-center items-center p-4">
            <div className="text-sm text-muted-foreground">Loading games...</div>
        </div>
    )

    if (error) return (
        <div className="p-4">
            <div className="text-sm text-destructive">{error}</div>
        </div>
    )

    if (!scheduleData?.games || scheduleData.games.length === 0) return (
        <div className="p-4">
            <div className="text-sm text-muted-foreground">No games scheduled</div>
        </div>
    )

    return (
        <div className="space-y-2">
            {scheduleData.games.map((game) => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    )
} 