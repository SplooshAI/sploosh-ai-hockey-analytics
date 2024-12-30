'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { getPlayByPlay } from '@/lib/api/nhl-edge/services/play-by-play'
import { Copy, Check, ArrowUp } from 'lucide-react'
import type { NHLEdgePlayByPlay } from '@/types/nhl-edge'

export default function Home() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [playByPlayData, setPlayByPlayData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGameSelect = async (gameId: number) => {
    try {
      setLoading(true)
      setError(null)
      setPlayByPlayData(null)
      const data = await getPlayByPlay(gameId.toString())
      setPlayByPlayData(data)
    } catch (err) {
      setError('Failed to load play-by-play data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyJson = async () => {
    if (!playByPlayData) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(playByPlayData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }

  return (
    <div className="h-screen overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
      <MainLayout onGameSelect={handleGameSelect}>
        <div className="max-w-7xl mx-auto space-y-6">
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
            <>
              <div className="overflow-auto relative">
                <button
                  onClick={handleCopyJson}
                  className="absolute top-2 right-2 p-2 rounded-md hover:bg-background/10 transition-colors"
                  title="Copy JSON"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <pre className="text-xs p-4 bg-muted rounded-lg">
                  {JSON.stringify(playByPlayData, null, 2)}
                </pre>
              </div>

              <a
                href="#top"
                className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg flex items-center justify-center"
              >
                <ArrowUp className="h-6 w-6" />
              </a>
            </>
          )}
        </div>
      </MainLayout>
    </div>
  )
}