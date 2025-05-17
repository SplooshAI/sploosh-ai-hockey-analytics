'use client'

import React from 'react'

interface AnimationControlsProps {
  speed: number
  setSpeed: (speed: number) => void
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  speed,
  setSpeed
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
