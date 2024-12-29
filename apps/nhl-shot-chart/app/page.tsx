import { Suspense } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import { Version } from '@/components/version/version'
import NHLEdgeHockeyRink from '@/components/nhl-edge-hockey-rink/nhl-edge-hockey-rink'

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-4xl font-bold">NHL Shot Chart</h1>
          <Suspense fallback={<div className="text-xs text-muted-foreground">Loading version info...</div>}>
            <Version />
          </Suspense>
        </div>

        <div className="text-center text-muted-foreground">
          <div className="flex justify-center items-center w-full h-full">
            <NHLEdgeHockeyRink className="w-full h-auto" centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png' centerIceLogoHeight={358} centerIceLogoWidth={400} displayZamboni={true} />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}