'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { GameCard } from '../card/game-card'
import { RefreshSettings } from '@/components/shared/refresh/refresh-settings'
import type { NHLEdgeGame } from '@/types/nhl-edge'
import { getScores } from '@/lib/api/nhl-edge'

interface GamesListProps {
    date: Date
    onGameSelect?: (gameId: number) => void
    onClose?: () => void
}

export function GamesList({ date, onGameSelect, onClose }: GamesListProps) {
    const [games, setGames] = useState<NHLEdgeGame[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const gamesRef = useRef<NHLEdgeGame[]>([])
    const lastDateRef = useRef(date)

    const fetchGames = useCallback(async () => {
        try {
            const isDateChange = format(date, 'yyyy-MM-dd') !== format(lastDateRef.current, 'yyyy-MM-dd')
            lastDateRef.current = date

            const scrollContainer = containerRef.current?.closest('.overflow-y-auto')
            const scrollPosition = scrollContainer?.scrollTop

            const formattedDate = format(date, 'yyyy-MM-dd')
            const scheduleData = await getScores(formattedDate)

            const updatedGames = await Promise.all(
                scheduleData.games.map(async (game) => {
                    // Fetch game center data if:
                    // 1. The date has changed (we need to check all games for special events)
                    // 2. OR the game is active (for auto-refresh updates)
                    if (isDateChange || game.gameState === 'LIVE' || game.gameState === 'CRIT') {
                        try {
                            const response = await fetch(`/api/nhl/game-center?gameId=${game.id}`)
                            if (response.ok) {
                                const gameCenterData = await response.json()
                                return {
                                    ...game,
                                    specialEvent: gameCenterData.specialEvent
                                }
                            }
                        } catch (error) {
                            console.error(`Failed to fetch game center data for game ${game.id}:`, error)
                        }
                    }
                    // Preserve existing special event data for non-active games during auto-refresh
                    if (!isDateChange) {
                        const existingGame = gamesRef.current.find(g => g.id === game.id)
                        return {
                            ...game,
                            specialEvent: existingGame?.specialEvent
                        }
                    }
                    return game
                })
            )

            setGames(updatedGames)
            gamesRef.current = updatedGames
            setLastRefreshTime(new Date())

            if (scrollPosition !== undefined) {
                requestAnimationFrame(() => {
                    scrollContainer?.scrollTo({
                        top: scrollPosition,
                        behavior: 'instant'
                    })
                })
            }
        } catch (err) {
            console.error('Error fetching games:', err)
            setError('Failed to load games')
        } finally {
            setLoading(false)
        }
    }, [date])

    // Initial fetch
    useEffect(() => {
        fetchGames()
    }, [fetchGames])

    // Auto-refresh setup
    useEffect(() => {
        if (!autoRefreshEnabled) return

        const intervalId = setInterval(() => fetchGames(), 20000) // 20 seconds

        return () => clearInterval(intervalId)
    }, [autoRefreshEnabled, fetchGames])

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

    if (!games || games.length === 0) return (
        <div className="p-4">
            <div className="text-sm text-muted-foreground">No games scheduled</div>
        </div>
    )

    return (
        <div className="space-y-4" ref={containerRef}>
            <RefreshSettings
                isEnabled={autoRefreshEnabled}
                onToggle={setAutoRefreshEnabled}
                lastRefreshTime={lastRefreshTime}
            />

            <div className="space-y-2">
                {games.map((game) => (
                    <GameCard
                        key={game.id}
                        game={game}
                        onSelectGame={onGameSelect}
                        onClose={onClose}
                    />
                ))}
            </div>

            <div className="pt-4 mt-4 border-t border-border/50">
                <RefreshSettings
                    isEnabled={autoRefreshEnabled}
                    onToggle={setAutoRefreshEnabled}
                    lastRefreshTime={lastRefreshTime}
                />
            </div>
        </div>
    )
} 