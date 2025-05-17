'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { AnimatedDataPoints } from '@/components/features/hockey-rink/animated-data-points/animated-data-points'
import type { NHLEdgePlay, NHLEdgePlayByPlay } from '@/lib/api/nhl-edge/types/nhl-edge'

// Sample data for demonstration
const SAMPLE_PLAYS: NHLEdgePlay[] = [
  {
    eventId: 1,
    period: 1,
    timeInPeriod: '01:30',
    timeRemaining: '18:30',
    situationCode: '5v5',
    typeCode: 'SHOT',
    typeDescKey: 'Shot',
    details: {},
    coordinates: { x: -30, y: 20 }
  },
  {
    eventId: 2,
    period: 1,
    timeInPeriod: '02:15',
    timeRemaining: '17:45',
    situationCode: '5v5',
    typeCode: 'BLOCK',
    typeDescKey: 'Blocked Shot',
    details: {},
    coordinates: { x: -40, y: 10 }
  },
  {
    eventId: 3,
    period: 1,
    timeInPeriod: '03:45',
    timeRemaining: '16:15',
    situationCode: '5v5',
    typeCode: 'SHOT',
    typeDescKey: 'Shot',
    details: {},
    coordinates: { x: 20, y: -15 }
  },
  {
    eventId: 4,
    period: 1,
    timeInPeriod: '05:20',
    timeRemaining: '14:40',
    situationCode: '5v5',
    typeCode: 'GOAL',
    typeDescKey: 'Goal',
    details: {},
    coordinates: { x: 25, y: 0 }
  },
  {
    eventId: 5,
    period: 1,
    timeInPeriod: '08:10',
    timeRemaining: '11:50',
    situationCode: '5v5',
    typeCode: 'HIT',
    typeDescKey: 'Hit',
    details: {},
    coordinates: { x: 0, y: 30 }
  },
  {
    eventId: 6,
    period: 1,
    timeInPeriod: '10:45',
    timeRemaining: '09:15',
    situationCode: '5v5',
    typeCode: 'MISS',
    typeDescKey: 'Missed Shot',
    details: {},
    coordinates: { x: -60, y: -10 }
  },
  {
    eventId: 7,
    period: 1,
    timeInPeriod: '12:30',
    timeRemaining: '07:30',
    situationCode: '5v5',
    typeCode: 'FACE',
    typeDescKey: 'Faceoff',
    details: {},
    coordinates: { x: 0, y: 0 }
  },
  {
    eventId: 8,
    period: 1,
    timeInPeriod: '15:00',
    timeRemaining: '05:00',
    situationCode: '5v5',
    typeCode: 'SHOT',
    typeDescKey: 'Shot',
    details: {},
    coordinates: { x: 70, y: 20 }
  },
  {
    eventId: 9,
    period: 1,
    timeInPeriod: '18:30',
    timeRemaining: '01:30',
    situationCode: '5v5',
    typeCode: 'GOAL',
    typeDescKey: 'Goal',
    details: {},
    coordinates: { x: 80, y: 5 }
  },
  {
    eventId: 10,
    period: 1,
    timeInPeriod: '19:45',
    timeRemaining: '00:15',
    situationCode: '5v5',
    typeCode: 'HIT',
    typeDescKey: 'Hit',
    details: {},
    coordinates: { x: 50, y: -25 }
  }
]

export default function AnimationDemo() {
  const [plays, setPlays] = useState<NHLEdgePlay[]>([])
  const [animate, setAnimate] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [showTrail, setShowTrail] = useState(true)
  const [trailLength, setTrailLength] = useState(5)
  const [loading, setLoading] = useState(true)
  // We're using the plays state directly instead of playByPlayData
  const [, setPlayByPlayData] = useState<NHLEdgePlayByPlay | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load sample data initially
  useEffect(() => {
    setPlays(SAMPLE_PLAYS)
    setLoading(false)
  }, [])
  
  // Handle game selection from sidebar
  const handleGameSelect = async (gameId: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/nhl/play-by-play?gameId=${gameId}`)
      const data = await response.json()
      setPlayByPlayData(data)
      
      // Extract plays with coordinates for visualization
      if (data && data.plays) {
        const playsWithCoordinates = data.plays.filter(
          (play: NHLEdgePlay) => play.coordinates && play.coordinates.x !== undefined && play.coordinates.y !== undefined
        )
        setPlays(playsWithCoordinates)
      }
    } catch (err) {
      setError('Failed to fetch play-by-play data')
      console.error('Error fetching play-by-play data:', err)
      // Fall back to sample data
      setPlays(SAMPLE_PLAYS)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout onGameSelect={handleGameSelect}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Animated Data Points Demo</h1>
        
        {error && (
          <div className="p-4 mb-6 bg-destructive/10 border border-destructive text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="p-4 mb-6 bg-muted text-muted-foreground rounded-md">
            Loading play data...
          </div>
        )}
        
        <div className="bg-card rounded-lg p-6 shadow-md mb-8">
          <div className="relative" style={{ zIndex: 0 }}>
            {/* Hockey Rink Component */}
            <NHLEdgeHockeyRink
              className="w-full h-auto"
              centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
              centerIceLogoHeight={358}
              centerIceLogoWidth={400}
              /* Use default ice texture */
            />
            
            {/* Animated Data Points Overlay */}
            {!loading && (
              <div className="absolute inset-0" style={{ zIndex: 10 }}>
                <AnimatedDataPoints
                  plays={plays}
                  animate={animate}
                  speed={speed}
                  showTrail={true} /* Always show trail */
                  trailLength={3} /* Show only the 3 most recent segments */
                  className="w-full h-full"
                  lineColor="#FF3333" /* Brighter red for high visibility against texture */
                  lineWidth={6}
                  /* We now use a simpler approach with individual line segments */
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Animation Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="animate-toggle" className="text-sm font-medium">
                  Enable Animation
                </label>
                <input
                  id="animate-toggle"
                  type="checkbox"
                  checked={animate}
                  onChange={(e) => setAnimate(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="trail-toggle" className="text-sm font-medium">
                  Show Trail
                </label>
                <input
                  id="trail-toggle"
                  type="checkbox"
                  checked={showTrail}
                  onChange={(e) => setShowTrail(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="speed-slider" className="text-sm font-medium">
                    Animation Speed: {speed}x
                  </label>
                </div>
                <input
                  id="speed-slider"
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="trail-slider" className="text-sm font-medium">
                    Trail Length: {trailLength}
                  </label>
                </div>
                <input
                  id="trail-slider"
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={trailLength}
                  onChange={(e) => setTrailLength(parseInt(e.target.value))}
                  disabled={!showTrail}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Event Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#CC3333] mr-2"></div>
                <span>Goal</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#3366CC] mr-2"></div>
                <span>Shot</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#33CC33] mr-2"></div>
                <span>Block</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#FF9900] mr-2"></div>
                <span>Hit</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#9966CC] mr-2"></div>
                <span>Miss</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-[#FFCC00] mr-2"></div>
                <span>Faceoff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
