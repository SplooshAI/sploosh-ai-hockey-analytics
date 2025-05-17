'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { NHLEdgePlay } from '@/lib/api/nhl-edge/types/nhl-edge'

interface AnimatedDataPointsProps {
  plays?: NHLEdgePlay[]
  width?: number
  height?: number
  className?: string
  animate?: boolean
  speed?: number
  showTrail?: boolean
  trailLength?: number
  lineColor?: string
  lineWidth?: number
}

interface DataPoint {
  id: number
  x: number
  y: number
  type: string
  period: number
  timeInPeriod: string
  color: string
  size: number
  emoji: string
  persistent: boolean
  details?: any
}

/**
 * AnimatedDataPoints component for visualizing hockey play data with animations
 * 
 * This component overlays animated data points on top of the hockey rink visualization.
 * It can be used to show shot locations, player movements, or other events.
 */
export const AnimatedDataPoints: React.FC<AnimatedDataPointsProps> = ({
  plays = [],
  width = 2400,
  height = 1020,
  className = '',
  animate = true,
  speed = 1,
  showTrail = false,
  trailLength = 5,
  lineColor = 'rgba(255, 255, 255, 0.7)',
  lineWidth = 3
}) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Add a reset key to force re-render of trails
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)

  // Map play types to colors (avoiding red)
  const getColorForPlayType = (typeCode: string): string => {
    switch (typeCode) {
      case 'SHOT':
        return '#3366CC' // Blue
      case 'GOAL':
        return '#33CC33' // Green
      case 'HIT':
        return '#FF9900' // Orange
      case 'BLOCK':
        return '#6699FF' // Light Blue
      case 'MISS':
        return '#9966CC' // Purple
      case 'FACE':
        return '#FFCC00' // Yellow
      default:
        return '#999999' // Gray
    }
  }

  // Map play types to point sizes
  const getSizeForPlayType = (typeCode: string): number => {
    switch (typeCode) {
      case 'GOAL':
        return 20
      case 'SHOT':
        return 15
      case 'BLOCK':
        return 15
      case 'MISS':
        return 15
      case 'HIT':
        return 12
      default:
        return 10
    }
  }
  
  // Map play types to emojis
  const getEmojiForPlayType = (typeCode: string): string => {
    switch (typeCode) {
      case 'SHOT':
        return '🏒' // Hockey stick
      case 'GOAL':
        return '🥅' // Goal net
      case 'HIT':
        return '💥' // Collision
      case 'BLOCK':
        return '🛡️' // Shield
      case 'MISS':
        return '❌' // X mark
      case 'FACE':
        return '🔄' // Circular arrows
      default:
        return '⚪' // White circle
    }
  }
  
  // Determine if a play type should persist on screen
  const shouldPersist = (typeCode: string): boolean => {
    return ['SHOT', 'BLOCK', 'MISS', 'GOAL'].includes(typeCode)
  }

  // Convert plays to data points
  useEffect(() => {
    if (plays.length === 0) return

    const points = plays
      .filter(play => play.coordinates && play.coordinates.x !== undefined && play.coordinates.y !== undefined)
      .map(play => ({
        id: play.eventId,
        x: play.coordinates!.x,
        y: play.coordinates!.y,
        type: play.typeCode,
        period: play.period,
        timeInPeriod: play.timeInPeriod,
        color: getColorForPlayType(play.typeCode),
        size: getSizeForPlayType(play.typeCode),
        emoji: getEmojiForPlayType(play.typeCode),
        persistent: shouldPersist(play.typeCode),
        details: play.details
      }))

    setDataPoints(points)
    setCurrentIndex(0)
  }, [plays])

  // Animation loop using requestAnimationFrame for smooth animation
  useEffect(() => {
    if (!animate || !isPlaying || dataPoints.length === 0) return
    
    let lastUpdateTime = Date.now()
    const animationSpeed = 1000 / speed // ms between points
    
    const animationLoop = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastUpdateTime
      
      if (elapsed >= animationSpeed) {
        lastUpdateTime = now
        
        // Move to next point or reset if at the end
        if (currentIndex >= dataPoints.length - 1) {
          // Animation complete, reset
          setTimeout(() => {
            // Clear all trails by incrementing the reset key
            setResetKey(prev => prev + 1) 
            // Reset to the beginning
            setCurrentIndex(0)
            // Continue playing (automatic looping)
          }, 1000) // Wait a second before resetting
        } else {
          // Move to next point
          setCurrentIndex(prev => prev + 1)
        }
      }
    }, 16) // ~60fps for smooth animation

    return () => clearInterval(animationLoop)
  }, [animate, dataPoints, isPlaying, speed, currentIndex, dataPoints.length])

  // Force initial render of all points when not animating
  useEffect(() => {
    if (!animate && dataPoints.length > 0) {
      setCurrentIndex(dataPoints.length - 1)
    }
  }, [animate, dataPoints.length])

  useEffect(() => {
    if (animate) {
      handleReset()
    }
  }, [animate])

  const handleReset = () => {
    setResetKey(prev => prev + 1) // Increment reset key to force re-render
    setCurrentIndex(0)
    setIsPlaying(false)
  }

  // Get the current point only
  const currentPoint = React.useMemo(() => {
    if (dataPoints.length === 0 || currentIndex >= dataPoints.length) return null
    return dataPoints[currentIndex]
  }, [dataPoints, currentIndex])
  
  // Get the previous point for drawing the connecting line
  const previousPoint = React.useMemo(() => {
    if (currentIndex <= 0 || !showTrail) return null
    return dataPoints[currentIndex - 1]
  }, [dataPoints, currentIndex, showTrail])
  
  // Get visible trail points
  const visibleTrailPoints = showTrail
    ? dataPoints.slice(0, currentIndex + 1).slice(-trailLength)
    : []
    
  // Get persistent points that should always be visible
  const persistentPoints = React.useMemo(() => {
    return dataPoints
      .slice(0, currentIndex + 1)
      .filter(point => point.persistent)
  }, [dataPoints, currentIndex])

  // Calculate the trail segments to show (only the most recent ones)
  const trailSegments = React.useMemo(() => {
    if (!showTrail || currentIndex <= 0) return []
    
    const segments = []
    // Only show the most recent segments
    const startIdx = Math.max(0, currentIndex - trailLength)
    
    // Only include the most recent segments
    for (let i = startIdx; i < currentIndex; i++) {
      segments.push({
        from: dataPoints[i],
        to: dataPoints[i + 1],
        index: i
      })
    }
    
    // Ensure we only show exactly trailLength segments at most
    return segments.slice(-trailLength)
  }, [dataPoints, currentIndex, showTrail, trailLength])

  // Convert rink coordinates to SVG coordinates
  const transformCoordinates = (x: number, y: number) => {
    // NHL rink is 200 feet x 85 feet
    // SVG viewBox is width x height
    // Convert from NHL coordinates to SVG coordinates
    const svgX = (x + 100) / 200 * width
    const svgY = (y + 42.5) / 85 * height
    
    return { x: svgX, y: svgY }
  }
  
  // Calculate rotation angle for direction indicators
  const calculateRotation = (point: DataPoint, index: number, points: DataPoint[]) => {
    if (index <= 0 || index >= points.length) return 0
    
    const prev = points[index - 1]
    const dx = point.x - prev.x
    const dy = point.y - prev.y
    
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  // Format event details for display
  const formatEventDetails = (point: DataPoint) => {
    const typeMap: Record<string, string> = {
      'SHOT': 'Shot on Goal',
      'GOAL': 'Goal',
      'HIT': 'Hit',
      'BLOCK': 'Blocked Shot',
      'MISS': 'Missed Shot',
      'FACE': 'Faceoff'
    }
    
    return {
      type: typeMap[point.type] || point.type,
      period: `Period ${point.period}`,
      time: `Time: ${point.timeInPeriod}`,
      coordinates: `Position: (${point.x.toFixed(1)}, ${point.y.toFixed(1)})`,
      details: point.details ? JSON.stringify(point.details) : ''
    }
  }
  
  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0 w-full h-full"
      >
        {/* Persistent points that should always be visible */}
        {persistentPoints.map((point) => {
          const { x, y } = transformCoordinates(point.x, point.y);
          return (
            <g 
              key={`persistent-${point.id}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible larger hit area for better hover - placed first so it's below other elements */}
              <circle
                cx={x}
                cy={y}
                r={point.size * 2}
                fill="rgba(255,255,255,0.01)"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ pointerEvents: 'all' }}
              />
              <circle
                cx={x}
                cy={y}
                r={point.size}
                fill={point.color}
                fillOpacity={0.6}
                stroke="white"
                strokeWidth={1.5}
                pointerEvents="none"
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={point.size * 0.8}
                pointerEvents="none"
              >
                {point.emoji}
              </text>
            </g>
          );
        })}
        
        {/* Trail segments */}
        {trailSegments.map((segment, idx) => (
          <motion.line
            key={`trail-${segment.from.id}-${segment.to.id}-${resetKey}`}
            x1={transformCoordinates(segment.from.x, segment.from.y).x}
            y1={transformCoordinates(segment.from.x, segment.from.y).y}
            x2={transformCoordinates(segment.to.x, segment.to.y).x}
            y2={transformCoordinates(segment.to.x, segment.to.y).y}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ 
              pathLength: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }}
          />
        ))}
        
        {/* Trail point markers */}
        {visibleTrailPoints.length > 0 && (
          <g>
            {visibleTrailPoints.map((point, idx) => {
              if (idx === visibleTrailPoints.length - 1) return null // Skip the current point
              
              const { x, y } = transformCoordinates(point.x, point.y)
              const size = point.size * 0.7 // Make trail points smaller
              const opacity = 0.5 + (idx / visibleTrailPoints.length) * 0.5 // Fade out older points
              
              // Only show non-persistent points in the trail
              if (point.persistent) return null;
              
              return (
                <g key={`trail-point-${point.id}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={point.color}
                    opacity={opacity}
                    stroke="white"
                    strokeWidth={1}
                    strokeOpacity={opacity}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.8}
                    opacity={opacity}
                  >
                    {point.emoji}
                  </text>
                </g>
              );
            })}
          </g>
        )}
        
        {/* Current segment - animate this one */}
        {previousPoint && currentPoint && (
          <motion.g key={`current-segment-${currentIndex}`}>
            <motion.line
              x1={transformCoordinates(previousPoint.x, previousPoint.y).x}
              y1={transformCoordinates(previousPoint.x, previousPoint.y).y}
              x2={transformCoordinates(currentPoint.x, currentPoint.y).x}
              y2={transformCoordinates(currentPoint.x, currentPoint.y).y}
              stroke={lineColor}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.g>
        )}
        
        {/* Current active point */}
        {currentPoint && (() => {
          const { x, y } = transformCoordinates(currentPoint.x, currentPoint.y);
          
          // Skip rendering if this is a persistent point (already rendered)
          if (currentPoint.persistent) return null;
          
          return (
            <g 
              key={`active-point-${currentIndex}`}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible larger hit area for better hover */}
              <circle
                cx={x}
                cy={y}
                r={currentPoint.size * 2}
                fill="rgba(255,255,255,0.01)"
                onMouseEnter={() => setHoveredPoint(currentPoint)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ pointerEvents: 'all' }}
              />
              {/* Direction indicator */}
              {previousPoint && (
                <motion.polygon
                  points="0,-8 4,0 0,8 -4,0"
                  fill={currentPoint.color}
                  stroke="white"
                  strokeWidth={1}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    transform: `translate(${x}px, ${y}px) rotate(${previousPoint ? calculateRotation(currentPoint, 1, [previousPoint, currentPoint]) : 0}deg)`
                  }}
                />
              )}
              
              {/* Glow effect for better visibility */}
              <motion.circle
                cx={x}
                cy={y}
                r={currentPoint.size * 1.5}
                fill={currentPoint.color}
                opacity={0.2}
                pointerEvents="none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: animate ? [1, 1.4, 1] : 1,
                  opacity: 0.2
                }}
                transition={{ 
                  scale: {
                    duration: 0.8,
                    repeat: animate ? Infinity : 0,
                    repeatType: "loop"
                  },
                  opacity: {
                    duration: 0.3,
                    ease: "easeInOut"
                  }
                }}
              />
              
              {/* Main data point with emoji */}
              <motion.g>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={currentPoint.size}
                  fill={currentPoint.color}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: animate ? [1, 1.3, 1] : 1,
                    opacity: 1
                  }}
                  transition={{ 
                    scale: {
                      duration: 0.7,
                      repeat: animate ? Infinity : 0,
                      repeatType: "loop"
                    },
                    opacity: {
                      duration: 0.3,
                      ease: "easeInOut"
                    }
                  }}
                />
                <motion.text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={currentPoint.size * 0.8}
                  pointerEvents="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPoint.emoji}
                </motion.text>
              </motion.g>
            </g>
          );
        })()}
      </svg>
      
      {/* Hover tooltip */}
      {hoveredPoint && (() => {
        const { x, y } = transformCoordinates(hoveredPoint.x, hoveredPoint.y);
        const details = formatEventDetails(hoveredPoint);
        
        // Calculate percentage position for better positioning
        const svgRect = document.querySelector('svg')?.getBoundingClientRect();
        const viewportWidth = svgRect?.width || width;
        const viewportHeight = svgRect?.height || height;
        
        // Convert SVG coordinates to percentage of viewport
        const xPercent = (x / width) * 100;
        const yPercent = (y / height) * 100;
        
        // Position tooltip based on which quadrant the point is in
        let tooltipPosition: React.CSSProperties = {};
        
        if (xPercent < 50) {
          // Left side of ice
          tooltipPosition.left = `calc(${xPercent}% + 30px)`;
        } else {
          // Right side of ice
          tooltipPosition.right = `calc(${100 - xPercent}% + 30px)`;
        }
        
        if (yPercent < 50) {
          // Top half of ice
          tooltipPosition.top = `calc(${yPercent}% + 30px)`;
        } else {
          // Bottom half of ice
          tooltipPosition.bottom = `calc(${100 - yPercent}% + 30px)`;
        }
        
        return (
          <div 
            className="absolute bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg z-20 min-w-[200px] max-w-[300px]"
            style={tooltipPosition}
          >
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-2">{hoveredPoint.emoji}</span>
              <span className="text-lg font-bold">{details.type}</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>{details.period}</p>
              <p>{details.time}</p>
              <p>{details.coordinates}</p>
              {details.details && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="font-semibold">Additional Details:</p>
                  <p className="text-xs overflow-hidden text-ellipsis">{details.details}</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
      
      {plays.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-wrap gap-2 z-10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-lg"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => setCurrentIndex(0)}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium shadow-lg"
            disabled={currentIndex === 0}
          >
            Reset
          </button>
          <div className="px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground rounded-md text-sm font-medium shadow-lg">
            {currentIndex + 1} / {dataPoints.length}
          </div>
        </div>
      )}
    </div>
  )
}
