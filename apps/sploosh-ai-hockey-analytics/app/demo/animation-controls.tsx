'use client'

import React from 'react'

interface AnimationControlsProps {
  speed: number
  setSpeed: (speed: number) => void
  showTrail: boolean
  setShowTrail: (show: boolean) => void
  trailLength: number
  setTrailLength: (length: number) => void
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  speed,
  setSpeed,
  showTrail,
  setShowTrail,
  trailLength,
  setTrailLength
}) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Animation Controls</h2>
      
      <div className="space-y-6">
        {/* Animation speed control */}
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
        
        {/* Trail controls */}
        <div className="space-y-2">
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
        

      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Event Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
  )
}
