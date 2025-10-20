'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layouts/main-layout'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { GameHeader } from '@/components/features/game-header'
import { ShotChart } from '@/components/features/shot-chart/shot-chart'
import { GameTimeline } from '@/components/features/game-timeline/game-timeline'
import { hasLocationData } from '@/lib/utils/shot-chart-utils'
import { Check, Copy, Download } from 'lucide-react'
import type { NHLEdgePlayByPlay } from '../lib/api/nhl-edge/types/nhl-edge'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playByPlayData, setPlayByPlayData] = useState<NHLEdgePlayByPlay | null>(null)
  const [gameCenterData, setGameCenterData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)

  const fetchGameData = async (gameId: number) => {
    try {
      // Fetch both play-by-play and game center data in parallel
      const [playByPlayResponse, gameCenterResponse] = await Promise.all([
        fetch(`/api/nhl/play-by-play?gameId=${gameId}`),
        fetch(`/api/nhl/game-center?gameId=${gameId}`)
      ])
      
      const [playByPlayData, gameCenterData] = await Promise.all([
        playByPlayResponse.json(),
        gameCenterResponse.json()
      ])
      
      setPlayByPlayData(playByPlayData)
      setGameCenterData(gameCenterData)
      setLastRefreshTime(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to fetch game data')
      console.error('Error fetching game data:', err)
    }
  }

  const handleGameSelect = async (gameId: number) => {
    setLoading(true)
    setError(null)
    setSelectedGameId(gameId)

    // Update URL with gameId query parameter
    router.push(`?gameId=${gameId}`, { scroll: false })

    await fetchGameData(gameId)
    setLoading(false)
  }

  // Load game from URL on mount or when URL changes
  useEffect(() => {
    const gameIdParam = searchParams.get('gameId')
    if (gameIdParam) {
      const gameId = parseInt(gameIdParam, 10)
      if (!isNaN(gameId) && gameId !== selectedGameId && !loading) {
        setLoading(true)
        setError(null)
        setSelectedGameId(gameId)
        fetchGameData(gameId).finally(() => setLoading(false))
      }
    }
  }, [searchParams, selectedGameId, loading])

  // Handle sidebar refresh - refresh selected game data
  const handleSidebarRefresh = () => {
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
        <div className="text-center text-destructive">
          {error}
        </div>
      )}

      {playByPlayData && (
        <div className="space-y-6">
          {/* Game Header */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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