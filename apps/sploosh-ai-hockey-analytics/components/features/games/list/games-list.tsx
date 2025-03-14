'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { GameCard } from '../card/game-card'
import { RefreshSettings } from '@/components/shared/refresh/refresh-settings'
import type { NHLEdgeGame } from '@/lib/api/nhl-edge/types/nhl-edge'
import { getScores, getGameCenter } from '@/lib/api/nhl-edge'
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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const debouncedDate = useDebounce(date, 300)
    const isNavigating = format(date, 'yyyy-MM-dd') !== format(debouncedDate, 'yyyy-MM-dd')
    const initialLoadCompletedRef = useRef(false)
    const currentDateRef = useRef(format(date, 'yyyy-MM-dd'))
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const fetchGames = useCallback(async () => {
        try {
            setIsLoading(true)
            const currentFormattedDate = format(date, 'yyyy-MM-dd')
            const scoresData = await getScores(currentFormattedDate)

            // If this is a refresh (same date) and we have existing games with special events
            if (currentFormattedDate === currentDateRef.current && games.length > 0) {
                // Only fetch game center for games transitioning from PRE to LIVE
                const enrichedGames = await Promise.all(
                    scoresData.games.map(async (game) => {
                        const existingGame = games.find(g => g.id === game.id)

                        // If game transitioned from PRE to LIVE, fetch fresh game center data
                        if (existingGame?.gameState === 'PRE' && game.gameState === 'LIVE') {
                            try {
                                const gameCenterData = await getGameCenter(game.id.toString())
                                return { ...game, ...gameCenterData }
                            } catch (error) {
                                console.error(`Failed to fetch game center data for game ${game.id}:`, error)
                                return game
                            }
                        }

                        // Otherwise, merge new scores data with existing special event data
                        return {
                            ...game,
                            specialEvent: existingGame?.specialEvent
                        }
                    })
                )
                setGames(enrichedGames)
            } else {
                // New date or initial load - fetch game center data for all games
                const enrichedGames = await Promise.all(
                    scoresData.games.map(async (game) => {
                        try {
                            const gameCenterData = await getGameCenter(game.id.toString())
                            return { ...game, ...gameCenterData }
                        } catch (error) {
                            console.error(`Failed to fetch game center data for game ${game.id}:`, error)
                            return game
                        }
                    })
                )
                setGames(enrichedGames)
            }

            // Update the current date ref after successful fetch
            currentDateRef.current = currentFormattedDate
            setLastRefreshTime(new Date())
        } catch (error) {
            console.error('Failed to fetch games:', error)
            setError(`Failed to fetch games: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }, [date, games])

    // Initial load
    useEffect(() => {
        if (!initialLoadCompletedRef.current) {
            initialLoadCompletedRef.current = true
            fetchGames()
        }
    }, [fetchGames])

    // Handle date changes
    useEffect(() => {
        const formattedDate = format(date, 'yyyy-MM-dd')
        if (!isNavigating && formattedDate !== currentDateRef.current) {
            setIsLoading(true)
            const fetchData = async () => {
                try {
                    const scoresData = await getScores(formattedDate)

                    // Always fetch game center data for new dates
                    const enrichedGames = await Promise.all(
                        scoresData.games.map(async (game) => {
                            try {
                                const gameCenterData = await getGameCenter(game.id.toString())
                                return { ...game, ...gameCenterData }
                            } catch (error) {
                                console.error(`Failed to fetch game center data for game ${game.id}:`, error)
                                return game
                            }
                        })
                    )

                    setGames(enrichedGames)
                    setLastRefreshTime(new Date())
                    currentDateRef.current = formattedDate
                } catch (error) {
                    console.error('Failed to fetch games:', error)
                    setError(`Failed to fetch games: ${error}`)
                } finally {
                    setIsLoading(false)
                }
            }

            fetchData()
        }
    }, [debouncedDate, isNavigating, date])

    // Auto-refresh timer
    useEffect(() => {
        if (!autoRefreshEnabled) {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
            return
        }

        refreshTimeoutRef.current = setTimeout(() => {
            fetchGames()
        }, 20000) // 20 seconds

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current)
            }
        }
    }, [autoRefreshEnabled, lastRefreshTime, fetchGames])

    if (isLoading && !games.length) {
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