'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import NHLEdgeHockeyRink from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { getPlayByPlay } from '@/lib/api/nhl-edge/services/play-by-play'

export default function Home() {
  const [playByPlayData, setPlayByPlayData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGameSelect = async (gameId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlayByPlay(gameId.toString())
      setPlayByPlayData(data)
    } catch (err) {
      setError('Failed to load play-by-play data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout onGameSelect={handleGameSelect}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-4xl font-bold">NHL Shot Chart</h1>
        </div>

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
          <div className="overflow-auto">
            <pre className="text-xs p-4 bg-muted rounded-lg">
              {JSON.stringify(playByPlayData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </MainLayout>
  )
}