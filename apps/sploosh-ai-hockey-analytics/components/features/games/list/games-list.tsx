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
    onRefresh?: () => void
    onLoadingChange?: (isLoading: boolean) => void
    onGamesCountChange?: (count: number) => void
}

export function GamesList({ date, onGameSelect, onClose, onRefresh, onLoadingChange, onGamesCountChange }: GamesListProps) {
    const [games, setGames] = useState<NHLEdgeGame[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const debouncedDate = useDebounce(date, 300)
    const isNavigating = format(date, 'yyyy-MM-dd') !== format(debouncedDate, 'yyyy-MM-dd')
    const initialLoadCompletedRef = useRef(false)
    const currentDateRef = useRef(format(date, 'yyyy-MM-dd'))
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const MAX_RETRY_ATTEMPTS = 3
    const RETRY_DELAY = 20000 // 20 seconds - matching the regular refresh interval

    const fetchGames = useCallback(async (attemptNumber = 0) => {
        try {
            setIsLoading(true)
            onLoadingChange?.(true)
            // Clear previous errors when attempting a new fetch
            if (error) setError(null)

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
            // Notify parent of refresh
            onRefresh?.()
            // Reset retry count on successful fetch
            setRetryCount(0)

            // Check if auto-refresh should be enabled based on game state
            // This ensures auto-refresh is re-enabled when connectivity is restored
            // and there are active games
            const shouldEnable = shouldEnableAutoRefresh(scoresData.games)
            if (shouldEnable && !autoRefreshEnabled) {
                setAutoRefreshEnabled(true)
            }
        } catch (error) {
            console.error('Failed to fetch games:', error)

            // Handle network errors specifically
            const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'

            if (isNetworkError && attemptNumber < MAX_RETRY_ATTEMPTS) {
                // Increment retry count for UI display
                setRetryCount(attemptNumber + 1)

                // Set a temporary error message indicating retry attempt
                setError(`Network error. Retrying... (${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`)

                // Schedule retry after delay
                setTimeout(() => {
                    fetchGames(attemptNumber + 1)
                }, RETRY_DELAY)

                // Don't set isLoading to false yet since we're retrying
                return
            } else {
                // Either not a network error or max retries reached
                setError(`Failed to fetch games: ${error}`)
                // Reset auto-refresh if we've hit max retries for network errors
                if (isNetworkError && attemptNumber >= MAX_RETRY_ATTEMPTS) {
                    setAutoRefreshEnabled(false)
                }
            }
        } finally {
            setIsLoading(false)
            onLoadingChange?.(false)
        }
    }, [date, games, error, autoRefreshEnabled, onLoadingChange])

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
            onLoadingChange?.(true)
            // Clear any existing errors when changing dates
            if (error) setError(null)

            const fetchData = async (attemptNumber = 0) => {
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
                    // Reset retry count on successful fetch
                    setRetryCount(0)

                    // Check if auto-refresh should be enabled based on game state
                    const shouldEnable = shouldEnableAutoRefresh(enrichedGames)
                    if (shouldEnable && !autoRefreshEnabled) {
                        setAutoRefreshEnabled(true)
                    }
                } catch (error) {
                    console.error('Failed to fetch games:', error)

                    // Handle network errors specifically
                    const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch'

                    if (isNetworkError && attemptNumber < MAX_RETRY_ATTEMPTS) {
                        // Increment retry count for UI display
                        setRetryCount(attemptNumber + 1)

                        // Set a temporary error message indicating retry attempt
                        setError(`Network error. Retrying... (${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`)

                        // Schedule retry after delay
                        setTimeout(() => {
                            fetchData(attemptNumber + 1)
                        }, RETRY_DELAY)

                        // Don't set isLoading to false yet since we're retrying
                        return
                    } else {
                        // Either not a network error or max retries reached
                        setError(`Failed to fetch games: ${error}`)
                        // Reset auto-refresh if we've hit max retries for network errors
                        if (isNetworkError && attemptNumber >= MAX_RETRY_ATTEMPTS) {
                            setAutoRefreshEnabled(false)
                        }
                    }
                } finally {
                    setIsLoading(false)
                    onLoadingChange?.(false)
                }
            }

            fetchData()
        }
    }, [debouncedDate, isNavigating, date, error, autoRefreshEnabled, onLoadingChange])

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

    // Log retry count for debugging purposes
    useEffect(() => {
        if (retryCount > 0) {
            console.log(`Retry attempt ${retryCount} of ${MAX_RETRY_ATTEMPTS}`)
        }
    }, [retryCount])

    // Notify parent of games count changes
    useEffect(() => {
        onGamesCountChange?.(games.length)
    }, [games.length, onGamesCountChange])

    // Show skeleton when loading and either no games or navigating to a different date
    const isChangingDate = isNavigating || (isLoading && format(date, 'yyyy-MM-dd') !== currentDateRef.current)
    
    if (isLoading && (!games.length || isChangingDate)) {
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
                <div className="text-sm text-destructive space-y-2">
                    <div>{error}</div>
                    {error.includes('Failed to fetch') && !error.includes('Retrying') && (
                        <button
                            onClick={() => {
                                // When manually retrying, check if auto-refresh should be re-enabled
                                const shouldEnable = shouldEnableAutoRefresh(games)
                                if (shouldEnable && !autoRefreshEnabled) {
                                    setAutoRefreshEnabled(true)
                                }
                                fetchGames()
                            }}
                            className="mt-2 px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                        >
                            Retry Now
                        </button>
                    )}
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