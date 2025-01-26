'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { GameCard } from '../card/game-card'
import { RefreshSettings } from '@/components/shared/refresh/refresh-settings'
import type { NHLEdgeGame } from '@/lib/api/nhl-edge/types/nhl-edge'
import { getScores } from '@/lib/api/nhl-edge'
import { useDebounce } from '@/hooks/use-debounce'
import { GamesListSkeleton } from './games-list-skeleton'
import { shouldEnableAutoRefresh } from '@/lib/utils/game-state'

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
    const debouncedDate = useDebounce(date, 300)
    const isNavigating = format(date, 'yyyy-MM-dd') !== format(debouncedDate, 'yyyy-MM-dd')
    const initialLoadCompletedRef = useRef(false)
    const currentDateRef = useRef(format(date, 'yyyy-MM-dd'))
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const fetchGames = useCallback(async (isInitialLoad = false, isDateChange = false) => {
        if (isNavigating) return

        try {
            setLoading(true)
            const formattedDate = format(date, 'yyyy-MM-dd')

            // Always get scores, but only get game center data on initial/date change
            const scheduleData = await getScores(formattedDate)

            const updatedGames = await Promise.all(
                scheduleData.games.map(async (game) => {
                    // Only fetch game center on initial load or date change
                    if (isInitialLoad || isDateChange) {
                        try {
                            const response = await fetch(`/api/nhl/game-center?gameId=${game.id}`)
                            if (!response.ok) {
                                console.error(`Game center fetch failed for game ${game.id}:`, await response.text())
                                throw new Error(`HTTP error! status: ${response.status}`)
                            }
                            const gameCenterData = await response.json()
                            return {
                                ...game,
                                specialEvent: gameCenterData.specialEvent,
                                matchup: gameCenterData.matchup
                            }
                        } catch (error) {
                            console.error(`Failed to fetch game center data for game ${game.id}:`, error)
                        }
                    }

                    const existingGame = gamesRef.current.find(g => g.id === game.id)
                    return {
                        ...game,
                        specialEvent: existingGame?.specialEvent,
                        matchup: existingGame?.matchup
                    }
                })
            )

            gamesRef.current = updatedGames
            setGames(updatedGames)
            setLastRefreshTime(new Date())
            setError(null)
        } catch (error) {
            console.error('Error fetching games:', error)
            setError('Failed to fetch games')
        } finally {
            setLoading(false)
        }
    }, [date, isNavigating, autoRefreshEnabled])

    // Initial load
    useEffect(() => {
        if (!initialLoadCompletedRef.current) {
            initialLoadCompletedRef.current = true
            fetchGames(true, false)
        }
    }, [fetchGames])

    // Handle date changes
    useEffect(() => {
        const formattedDate = format(date, 'yyyy-MM-dd')
        if (!isNavigating && formattedDate !== currentDateRef.current) {
            currentDateRef.current = formattedDate
            fetchGames(false, true)
        }
    }, [debouncedDate, fetchGames, isNavigating, date])

    // Auto-refresh timer
    useEffect(() => {
        if (!autoRefreshEnabled) {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
            return
        }

        refreshTimeoutRef.current = setTimeout(() => {
            fetchGames(false, false)
        }, 20000) // 20 seconds

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
        }
    }, [autoRefreshEnabled, lastRefreshTime, fetchGames])

    if (loading && !games.length) {
        return <GamesListSkeleton />
    }

    return (
        <div ref={containerRef} className="space-y-4">
            <RefreshSettings
                isEnabled={autoRefreshEnabled}
                onToggle={setAutoRefreshEnabled}
                lastRefreshTime={lastRefreshTime}
                defaultEnabled={shouldEnableAutoRefresh(games)}
            />
            {error && (
                <div className="text-sm text-destructive">
                    {error}
                </div>
            )}
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
        </div>
    )
} 