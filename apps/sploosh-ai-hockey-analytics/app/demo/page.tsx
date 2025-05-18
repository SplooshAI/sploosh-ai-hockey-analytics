'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layouts/main-layout'
import { RinkControlPanel } from '@/components/features/hockey-rink/rink-control-panel/rink-control-panel'
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
  // We need both animate state and setter for the animation controls
  const [animate, setAnimate] = useState(true) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [speed, setSpeed] = useState(1)
  const [showTrail, setShowTrail] = useState(true)
  const [trailLength, setTrailLength] = useState(2)
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
        
        {/* Use the new RinkControlPanel component */}
        {!loading && (
          <RinkControlPanel
            plays={plays}
            speed={speed}
            setSpeed={setSpeed}
            showTrail={showTrail}
            setShowTrail={setShowTrail}
            trailLength={trailLength}
            setTrailLength={setTrailLength}
            centerIceLogo='/sploosh.ai/sploosh-ai-character-transparent.png'
            centerIceLogoHeight={358}
            centerIceLogoWidth={400}
          />
        )}
      </div>
    </MainLayout>
  )
}
