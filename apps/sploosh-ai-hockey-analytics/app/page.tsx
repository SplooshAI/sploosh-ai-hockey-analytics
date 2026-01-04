'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layouts/main-layout'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { GameHeader } from '@/components/features/game-header'
import { ShotChart } from '@/components/features/shot-chart/shot-chart'
import { GameTimeline } from '@/components/features/game-timeline/game-timeline'
import { ErrorMessage } from '@/components/shared/error'
import { hasLocationData } from '@/lib/utils/shot-chart-utils'
import { getFriendlyErrorMessage, getFriendlyErrorTitle } from '@/lib/utils/error-messages'
import { Check, Copy, Download } from 'lucide-react'
import type { NHLEdgePlayByPlay } from '../lib/api/nhl-edge/types/nhl-edge'

function HomeContent() {
  const searchParams = useSearchParams()
  const [playByPlayData, setPlayByPlayData] = useState<NHLEdgePlayByPlay | null>(null)
  const [gameCenterData, setGameCenterData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const isSelectingGameRef = useRef(false)
  const selectedGameIdRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    selectedGameIdRef.current = selectedGameId
  }, [selectedGameId])

  const fetchGameData = async (gameId: number) => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      // Fetch both play-by-play and game center data in parallel
      const [playByPlayResponse, gameCenterResponse] = await Promise.all([
        fetch(`/api/nhl/play-by-play?gameId=${gameId}`, { signal: abortController.signal }),
        fetch(`/api/nhl/game-center?gameId=${gameId}`, { signal: abortController.signal })
      ])
      
      const [playByPlayData, gameCenterData] = await Promise.all([
        playByPlayResponse.json(),
        gameCenterResponse.json()
      ])
      
      // Only update state if this is still the selected game (use ref for current value)
      if (selectedGameIdRef.current === gameId) {
        setPlayByPlayData(playByPlayData)
        setGameCenterData(gameCenterData)
        setLastRefreshTime(new Date())
        setError(null)
      }
    } catch (err) {
      // Ignore abort errors - they're expected when switching games
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      
      if (selectedGameIdRef.current === gameId) {
        setError(getFriendlyErrorMessage(err))
        console.error('Error fetching game data:', err)
      }
    }
  }

  const handleGameSelect = async (gameId: number) => {
    // Prevent sidebar refresh from interfering with game selection
    isSelectingGameRef.current = true
    
    // Immediately clear old data and set loading
    setError(null)
    setPlayByPlayData(null)
    setGameCenterData(null)
    setLoading(true)
    setSelectedGameId(gameId)

    // Update URL with gameId query parameter (use replace to avoid navigation issues offline)
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('gameId', gameId.toString())
      window.history.replaceState({}, '', url)
    } catch (err) {
      console.error('Failed to update URL:', err)
    }
    
    // Fetch game data directly
    await fetchGameData(gameId).finally(() => setLoading(false))
    
    // Allow sidebar refresh again after game selection is complete
    setTimeout(() => {
      isSelectingGameRef.current = false
    }, 100)
  }

  // Load game from URL on mount or when URL changes
  useEffect(() => {
    const gameIdParam = searchParams.get('gameId')
    if (gameIdParam) {
      const gameId = parseInt(gameIdParam, 10)
      // Allow reloading the same game by checking if it's a valid gameId
      // This fixes the bug where clicking the current game in URL wouldn't reload
      if (!isNaN(gameId) && gameId !== selectedGameId) {
        setLoading(true)
        setError(null)
        setSelectedGameId(gameId)
        fetchGameData(gameId).finally(() => setLoading(false))
      }
    } else {
      // No gameId in URL - clear the selected game and show default view
      if (selectedGameId !== null) {
        setSelectedGameId(null)
        setPlayByPlayData(null)
        setGameCenterData(null)
        setError(null)
        setLastRefreshTime(null)
      }
    }
  }, [searchParams, selectedGameId])

  // Handle sidebar refresh - refresh selected game data
  const handleSidebarRefresh = () => {
    // Don't refresh if a game selection is in progress to avoid race condition
    if (isSelectingGameRef.current) {
      return
    }
    
    if (selectedGameId && playByPlayData) {
      // Only refresh non-final games
      const isFinalGame = playByPlayData.gameState === 'FINAL' || playByPlayData.gameState === 'OFF'
      if (!isFinalGame) {
        fetchGameData(selectedGameId)
      }
    }
  }

  const handleCopyJson = () => {
    if (playByPlayData) {
      navigator.clipboard.writeText(JSON.stringify(playByPlayData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadJson = () => {
    if (playByPlayData) {
      const gameDate = playByPlayData.gameDate.split('T')[0].replace(/-/g, '')
      const filename = `${gameDate}-${playByPlayData.awayTeam.abbrev}-vs-${playByPlayData.homeTeam.abbrev}-${playByPlayData.id}.json`
      const json = JSON.stringify(playByPlayData, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }

  return (
    <MainLayout onGameSelect={handleGameSelect} onSidebarRefresh={handleSidebarRefresh}>
      {/* Show playful rink only when no game is selected */}
      {!playByPlayData && !loading && !error && (
        <div className="text-center text-muted-foreground">
          <div className="flex justify-center items-center w-full h-full">
            <NHLEdgeHockeyRink
              className="w-full h-auto"
              centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
              centerIceLogoHeight={358}
              centerIceLogoWidth={400}
              displayZamboni={true}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-muted-foreground">
          Loading play-by-play data...
        </div>
      )}

      {error && (
        <div className="relative">
          {/* Background ice rink with zambonis */}
          <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
            <NHLEdgeHockeyRink
              className="w-full max-w-4xl h-auto"
              centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
              centerIceLogoHeight={358}
              centerIceLogoWidth={400}
              displayZamboni={true}
            />
          </div>
          {/* Error message overlay */}
          <div className="relative z-10 flex items-center justify-center min-h-[500px]">
            <div className="max-w-2xl mx-auto">
              <ErrorMessage
                title={getFriendlyErrorTitle(error)}
                message={error}
                onRetry={selectedGameId ? () => {
                  setLoading(true)
                  setError(null)
                  fetchGameData(selectedGameId).finally(() => setLoading(false))
                } : undefined}
                retryLabel="Try Again"
              />
            </div>
          </div>
        </div>
      )}

      {playByPlayData && (
        <div className="space-y-6">
          {/* Game Header */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            { }
            <GameHeader 
              gameData={{
                ...playByPlayData,
                gameCenterLink: `/gamecenter/${playByPlayData.id}/recap`,
                tvBroadcasts: gameCenterData?.tvBroadcasts || [],
                gameVideo: gameCenterData?.gameVideo
              } as any} 
              lastRefreshTime={lastRefreshTime} 
            />
          </div>

          {/* Visualization - Shot Chart or Timeline based on data availability */}
          {hasLocationData(playByPlayData) ? (
            <>
              {/* Shot Chart */}
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <ShotChart 
                  gameData={playByPlayData}
                  showCenterLogo={true}
                  centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
                />
              </div>

              {/* Timeline */}
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <GameTimeline gameData={playByPlayData} />
              </div>
            </>
          ) : (
            <div className="bg-card rounded-lg p-6 shadow-sm">
              {/* Future/Scheduled Games - Show Placeholder */}
              {(playByPlayData.gameState === 'FUT' || playByPlayData.gameState === 'PRE') ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="flex justify-center items-center w-full">
                    <NHLEdgeHockeyRink
                      className="w-full max-w-2xl h-auto opacity-20"
                      centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
                      centerIceLogoHeight={358}
                      centerIceLogoWidth={400}
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-muted-foreground">Upcoming Game</h3>
                    <p className="text-sm text-muted-foreground">
                      Check back after the game starts to see live stats and visualizations
                    </p>
                  </div>
                </div>
              ) : (playByPlayData.gameState === 'LIVE' || playByPlayData.gameState === 'CRIT') ? (
                /* Live Games with no shots yet - Show Timeline */
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      <strong>Game in Progress:</strong> No shots recorded yet. The shot chart will appear once shots are taken.
                    </p>
                  </div>
                  <GameTimeline gameData={playByPlayData} />
                </div>
              ) : (
                /* Historical Games - Show Timeline */
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>Historical Game:</strong> This game was played before shot location tracking was implemented (pre-2007). 
                      Showing timeline view with goals and penalties instead.
                    </p>
                  </div>
                  <GameTimeline gameData={playByPlayData} />
                </div>
              )}
            </div>
          )}

          {/* Raw JSON Data (Collapsible) */}
          <details className="bg-card rounded-lg p-6 shadow-sm">
            <summary className="cursor-pointer font-semibold text-lg mb-4">
              Raw Game Data (JSON)
            </summary>
            <div className="overflow-auto relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={handleDownloadJson}
                  className="p-2 rounded-md hover:bg-background/10 transition-colors"
                  title="Download JSON"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopyJson}
                  className="p-2 rounded-md hover:bg-background/10 transition-colors"
                  title="Copy JSON"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <pre className="text-xs p-4 bg-muted rounded-lg">
                {JSON.stringify(playByPlayData, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </MainLayout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}