'use client'

import React from 'react'

interface AnimationControlsProps {
  speed: number
  setSpeed: (speed: number) => void
  loopEnabled: boolean
  setLoopEnabled: (enabled: boolean) => void
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  speed,
  setSpeed,
  loopEnabled,
  setLoopEnabled
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
        
        {/* Loop toggle */}
        <div className="flex items-center justify-between mt-4">
          <label htmlFor="loop-toggle" className="text-sm font-medium">
            Loop Animation
          </label>
          <input
            id="loop-toggle"
            type="checkbox"
            checked={loopEnabled}
            onChange={(e) => setLoopEnabled(e.target.checked)}
            className="h-4 w-4"
          />
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
  )
}
