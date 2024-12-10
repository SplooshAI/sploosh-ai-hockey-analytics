import { Suspense } from 'react'
import NHLEdgeHockeyRink from '../components/nhl-edge-hockey-rink/nhl-edge-hockey-rink';
import { Version } from '../components/version/version';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-4xl font-bold text-center">Sploosh.AI NHL Shot Chart</h1>
          <Suspense fallback={<div className="text-xs text-muted-foreground">Loading version info...</div>}>
            <Version />
          </Suspense>
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <NHLEdgeHockeyRink className="w-full h-auto" />
        </div>
        <div className="flex justify-center items-center w-full h-full">
          <NHLEdgeHockeyRink className="w-full h-auto" centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png' centerIceLogoHeight={358} centerIceLogoWidth={400} displayZamboni={true} />
        </div>
      </div>
    </main>
  );
}