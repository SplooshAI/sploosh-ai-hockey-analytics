'use client'

import React, { useState } from 'react'
import { NHLEdgeHockeyRink } from '@/components/features/hockey-rink/nhl-edge-hockey-rink/nhl-edge-hockey-rink'
import { AnimatedDataPoints } from '@/components/features/hockey-rink/animated-data-points/animated-data-points'
import type { NHLEdgePlay } from '@/lib/api/nhl-edge/types/nhl-edge'

interface RinkControlPanelProps {
  plays: NHLEdgePlay[]
  className?: string
  speed: number
  setSpeed: (speed: number) => void
  showTrail: boolean
  setShowTrail: (show: boolean) => void
  trailLength: number
  setTrailLength: (length: number) => void
  centerIceLogo?: string
  centerIceLogoHeight?: number
  centerIceLogoWidth?: number
}

export const RinkControlPanel: React.FC<RinkControlPanelProps> = ({
  plays,
  className = '',
  speed,
  setSpeed,
  showTrail,
  setShowTrail,
  trailLength,
  setTrailLength,
  centerIceLogo = '/sploosh.ai/sploosh-ai-character-transparent.png',
  centerIceLogoHeight = 358,
  centerIceLogoWidth = 400
}) => {
  // Animation control state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  // Handle reset
  const handleReset = () => {
    setCurrentIndex(0)
  }
  
  // Handle index change from AnimatedDataPoints
  const handleIndexChange = (index: number | null) => {
    setCurrentIndex(index)
  }

  return (
    <div className={`${className} w-full`}>
      {/* Top Controls */}
      <div className="flex flex-col mb-4 bg-card rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Animation Controls</h2>
          <div className="px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground rounded-md text-sm font-medium shadow-lg">
            {currentIndex !== null ? `${currentIndex + 1} / ${plays.length}` : `0 / ${plays.length}`}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Play/Pause and Reset buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-lg"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium shadow-lg"
              disabled={currentIndex === 0}
            >
              Reset
            </button>
          </div>
          
          {/* Animation speed control */}
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor="speed-slider" className="text-sm font-medium whitespace-nowrap">
              Speed: {speed}x
            </label>
            <input
              id="speed-slider"
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Main content area with rink and side controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Hockey rink visualization container */}
        <div className="flex-1 relative bg-card rounded-lg p-4 shadow-md">
          {/* Hockey Rink Component */}
          <NHLEdgeHockeyRink
            className="w-full h-auto"
            centerIceLogo={centerIceLogo}
            centerIceLogoHeight={centerIceLogoHeight}
            centerIceLogoWidth={centerIceLogoWidth}
          />
          
          {/* Animated Data Points Overlay */}
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            <AnimatedDataPoints
              plays={plays}
              animate={true}
              speed={speed}
              showTrail={showTrail}
              trailLength={trailLength}
              className="w-full h-full"
              lineColor="#FF3333" /* Brighter red for high visibility against texture */
              lineWidth={6}
              isPlaying={isPlaying}
              onPlayPauseToggle={setIsPlaying}
              onReset={() => setCurrentIndex(0)}
              hideControls={true} // Hide built-in controls since we're providing our own
              currentIndex={currentIndex} // Pass current index to component
              onIndexChange={handleIndexChange} // Handle index changes
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="w-full md:w-64 bg-card rounded-lg p-4 shadow-md flex flex-col">
          {/* Trail controls */}
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-medium">Trail Settings</h3>
            <div className="flex justify-between items-center">
              <label htmlFor="trail-slider" className="text-sm font-medium">
                Trail Length: {trailLength}
              </label>
              <button 
                onClick={() => setShowTrail(!showTrail)}
                className={`text-xs px-2 py-1 rounded ${showTrail ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {showTrail ? 'Trail On' : 'Trail Off'}
              </button>
            </div>
            <input
              id="trail-slider"
              type="range"
              min={0}
              max={10}
              step={1}
              value={trailLength}
              onChange={(e) => setTrailLength(parseInt(e.target.value))}
              className="w-full"
              disabled={!showTrail}
            />
          </div>
          
          {/* Event Legend */}
          <div>
            <h3 className="text-lg font-medium mb-2">Event Legend</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#33CC33] rounded-full mr-2 text-sm">🥅</div>
                <span>Goal</span>
                <span className="ml-1 text-xs text-gray-500">(stays visible)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#3366CC] rounded-full mr-2 text-sm">🏒</div>
                <span>Shot</span>
                <span className="ml-1 text-xs text-gray-500">(stays visible)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#6699FF] rounded-full mr-2 text-sm">🛡️</div>
                <span>Block</span>
                <span className="ml-1 text-xs text-gray-500">(stays visible)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#FF9900] rounded-full mr-2 text-sm">💥</div>
                <span>Hit</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#9966CC] rounded-full mr-2 text-sm">❌</div>
                <span>Miss</span>
                <span className="ml-1 text-xs text-gray-500">(stays visible)</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center bg-[#FFCC00] rounded-full mr-2 text-sm">🔄</div>
                <span>Faceoff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
