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
  // We've removed the connecting lines style options since we now use a different approach
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
  // We now use a different approach for connecting lines
  lineColor = 'rgba(255, 255, 255, 0.7)',
  lineWidth = 3
}) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Add a reset key to force re-render of trails

  // Map play types to colors
  const getColorForPlayType = (typeCode: string): string => {
    switch (typeCode) {
      case 'SHOT':
        return '#3366CC' // Blue
      case 'GOAL':
        return '#CC3333' // Red
      case 'HIT':
        return '#FF9900' // Orange
      case 'BLOCK':
        return '#33CC33' // Green
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
      case 'HIT':
        return 12
      default:
        return 10
    }
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
        size: getSizeForPlayType(play.typeCode)
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

  // This function is now handled directly in the animation loop

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
  
  // Get the previous point (if any) for drawing the current segment
  const previousPoint = React.useMemo(() => {
    if (currentIndex <= 0 || !showTrail) return null
    return dataPoints[currentIndex - 1]
  }, [dataPoints, currentIndex, showTrail])
  
  // Calculate the trail segments to show (only the most recent ones)
  const trailSegments = React.useMemo(() => {
    if (!showTrail || currentIndex <= 0) return []
    
    const segments = []
    // Only show the most recent segments (exactly trailLength or fewer)
    const startIdx = Math.max(0, currentIndex - trailLength)
    
    // Only include the most recent segments
    for (let i = startIdx; i < currentIndex; i++) {
      segments.push({
        start: dataPoints[i],
        end: dataPoints[i + 1],
        index: i
      })
    }
    
    // Ensure we only show exactly trailLength segments at most
    return segments.slice(-trailLength)
  }, [dataPoints, currentIndex, showTrail, trailLength])

  // Convert rink coordinates to SVG coordinates
  const transformCoordinates = (x: number, y: number) => {
    // NHL coordinates are typically in a -100 to 100 range for x and -42.5 to 42.5 for y
    // We need to map these to our SVG viewBox coordinates
    
    // Center the x coordinate (0 at center ice)
    const svgX = (x + 100) * (width / 200)
    
    // Flip and center the y coordinate (positive y is up in NHL coords, down in SVG)
    const svgY = height - ((y + 42.5) * (height / 85))
    
    return { x: svgX, y: svgY }
  }
  
  // We're no longer using this function as we're drawing individual line segments
  
  // Calculate rotation angle for direction indicators
  const calculateRotation = (point: DataPoint, index: number, points: DataPoint[]) => {
    if (index === 0) return 0
    
    const prevPoint = points[index - 1]
    const { x: x1, y: y1 } = transformCoordinates(prevPoint.x, prevPoint.y)
    const { x: x2, y: y2 } = transformCoordinates(point.x, point.y)
    
    // Calculate angle in degrees
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
    return angle + 90 // Add 90 degrees to point in the direction of travel
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 20 }}
      >
        {/* Previous trail segments - only show the most recent ones */}
        {trailSegments.length > 0 && (
          <g className="trail-segments" key={`trail-segments-${resetKey}`}>
            {trailSegments.map((segment) => {
              const { x: x1, y: y1 } = transformCoordinates(segment.start.x, segment.start.y);
              const { x: x2, y: y2 } = transformCoordinates(segment.end.x, segment.end.y);
              
              // Calculate opacity based on how recent the segment is
              const recencyFactor = (segment.index - (currentIndex - trailLength)) / trailLength;
              const opacity = 0.3 + (0.7 * recencyFactor);
              
              return (
                <line
                  key={`segment-${resetKey}-${segment.index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={lineColor}
                  strokeWidth={lineWidth}
                  strokeLinecap="round"
                  strokeOpacity={opacity}
                />
              );
            })}
          </g>
        )}
        
        {/* Previous trail points - smaller, faded versions */}
        {trailSegments.length > 0 && (
          <g className="trail-points" key={`trail-points-${resetKey}`}>
            {trailSegments.map((segment) => {
              const { x, y } = transformCoordinates(segment.start.x, segment.start.y);
              
              // Calculate opacity based on how recent the point is
              const recencyFactor = (segment.index - (currentIndex - trailLength)) / trailLength;
              const opacity = 0.2 + (0.3 * recencyFactor);
              const size = segment.start.size * (0.5 + (0.3 * recencyFactor));
              
              return (
                <circle
                  key={`trail-point-${resetKey}-${segment.index}`}
                  cx={x}
                  cy={y}
                  r={size}
                  fill={segment.start.color}
                  opacity={opacity}
                  stroke="white"
                  strokeWidth={1}
                  strokeOpacity={opacity}
                />
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
          
          return (
            <g key={`active-point-${currentIndex}`}>
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
              
              {/* Main data point */}
              <motion.circle
                cx={x}
                cy={y}
                r={currentPoint.size}
                fill={currentPoint.color}
                stroke="white"
                strokeWidth={2}
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
            </g>
          );
        })()}
      </svg>
      
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
            {currentIndex} / {dataPoints.length}
          </div>
        </div>
      )}
    </div>
  )
}
