'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { ShotChart } from '@/components/features/shot-chart/shot-chart'
import { Check, Copy, Download } from 'lucide-react'
import type { NHLEdgePlayByPlay } from '../lib/api/nhl-edge/types/nhl-edge'

export default function Home() {
  const [playByPlayData, setPlayByPlayData] = useState<NHLEdgePlayByPlay | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGameSelect = async (gameId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/nhl/play-by-play?gameId=${gameId}`)
      const data = await response.json()
      setPlayByPlayData(data)
    } catch (err) {
      setError('Failed to fetch play-by-play data')
      console.error('Error fetching play-by-play data:', err)
    } finally {
      setLoading(false)
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
    <MainLayout onGameSelect={handleGameSelect}>
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
          {/* Shot Chart Visualization */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <ShotChart 
              gameData={playByPlayData}
              showTeamNames={true}
              showCenterLogo={true}
              centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
            />
          </div>

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