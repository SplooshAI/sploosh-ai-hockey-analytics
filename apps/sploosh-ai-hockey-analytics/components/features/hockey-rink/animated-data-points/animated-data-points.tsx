'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  temporaryPersistent?: boolean // For points like hits that should persist until the next point
  details?: Record<string, unknown>
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
  showTrail = true, // Default to showing trail
  trailLength = 2, // Default to 2 trail segments
  lineColor = 'rgba(255, 255, 255, 0.7)',
  lineWidth = 3
}) => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [resetKey, setResetKey] = useState(0) // Add a reset key to force re-render of trails
  // State for hover effects - used in the component for tooltips
  const [hoveredId, setHoveredId] = useState<number | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

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
  
  // Determine if a play type should persist on screen permanently
  const shouldPersist = (typeCode: string): boolean => {
    return ['SHOT', 'BLOCK', 'MISS', 'GOAL'].includes(typeCode)
  }
  
  // Determine if a play type should persist temporarily (until next point)
  const shouldTemporarilyPersist = (typeCode: string): boolean => {
    return ['HIT'].includes(typeCode)
  }

  // Convert plays to data points
  useEffect(() => {
    if (plays.length === 0) return

    const points = plays
      .filter(play => play.coordinates)
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
        temporaryPersistent: shouldTemporarilyPersist(play.typeCode),
        details: play.details
      }))

    setDataPoints(points)
    setCurrentIndex(0)
  }, [plays])

  // Animation loop using requestAnimationFrame for smooth animation
  useEffect(() => {
    if (!animate || !isPlaying || dataPoints.length === 0) return
    
    // Initialize currentIndex to 0 when play is clicked
    if (currentIndex === null) {
      setCurrentIndex(0)
      return
    }
    
    let lastUpdateTime = Date.now()
    const animationSpeed = 1000 / speed // ms between points
    
    const animationLoop = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastUpdateTime
      
      if (elapsed >= animationSpeed) {
        lastUpdateTime = now
        
        // Move to next point or reset if at the end
        if (currentIndex !== null && currentIndex >= dataPoints.length - 1) {
          // Animation complete, reset
          setTimeout(() => {
            // Clear all trails by incrementing the reset key
            setResetKey(prev => (prev ?? 0) + 1) 
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
    if (!animate && dataPoints.length > 0 && isPlaying) {
      setCurrentIndex(dataPoints.length - 1)
    }
  }, [animate, dataPoints.length, isPlaying])

  useEffect(() => {
    if (animate) {
      handleReset()
    }
  }, [animate])

  const handleReset = () => {
    setResetKey(prev => (prev ?? 0) + 1) // Increment reset key to force re-render
    setCurrentIndex(null)
    setIsPlaying(false)
  }

  // Get the current point only
  const currentPoint = React.useMemo(() => {
    if (dataPoints.length === 0 || currentIndex === null || currentIndex >= dataPoints.length) return null
    return dataPoints[currentIndex]
  }, [dataPoints, currentIndex])
  
  // Get the previous point for drawing the connecting line
  const previousPoint = React.useMemo(() => {
    if (currentIndex === null || currentIndex <= 0 || !showTrail) return null
    return dataPoints[currentIndex - 1]
  }, [dataPoints, currentIndex, showTrail])
  
  // Get visible trail points
  const visibleTrailPoints = showTrail && currentIndex !== null
    ? dataPoints.slice(0, currentIndex + 1).slice(-trailLength)
    : []
    
  // Get persistent points that should always be visible
  const persistentPoints = React.useMemo(() => {
    if (currentIndex === null) return []
    
    // Get permanently persistent points (shots, blocks, misses, goals)
    const permanentPoints = dataPoints
      .slice(0, currentIndex + 1)
      .filter(point => point.persistent)
    
    // Get temporarily persistent points (hits) - they should persist until the next point appears
    const tempPoints = [];
    if (currentIndex > 0) {
      // Look for temporarily persistent points (like hits)
      for (let i = 0; i < currentIndex; i++) {
        const point = dataPoints[i];
        
        // If this is a temporarily persistent point and we're currently showing the next point,
        // include it in the display
        if (point.temporaryPersistent && i + 1 === currentIndex) {
          tempPoints.push(point);
        }
      }
    }
    
    return [...permanentPoints, ...tempPoints];
  }, [dataPoints, currentIndex])

  // Calculate the trail segments to show (only the most recent ones)
  const trailSegments = React.useMemo(() => {
    if (!showTrail || currentIndex === null || currentIndex <= 0) return []
    
    const segments = []
    // Only show the most recent segments based on user's selected trail length
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

  // State for emoji scaling and tooltips
  const [hoveredEmoji, setHoveredEmoji] = useState<number | null>(null);
  const [activeEmoji, setActiveEmoji] = useState<number | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<DataPoint | null>(null);
  
  // Effect to animate the active emoji when it changes
  useEffect(() => {
    if (currentPoint && animate) {
      // Set the active emoji to pulse
      setActiveEmoji(currentPoint.id);
      
      // Clear the active emoji after animation duration
      const timer = setTimeout(() => {
        setActiveEmoji(null);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, animate, currentPoint]);
  
  // Function to handle emoji hover with debounce to prevent flickering
  const handleEmojiHover = (point: DataPoint, isHovered: boolean) => {
    if (isHovered) {
      // Immediately show highlight
      setHoveredEmoji(point.id);
      // Update tooltip info
      setTooltipInfo(point);
    } else {
      // Clear highlight immediately
      if (hoveredEmoji === point.id) {
        setHoveredEmoji(null);
      }
      
      // Small delay before hiding tooltip
      setTimeout(() => {
        if (tooltipInfo?.id === point.id) {
          setTooltipInfo(null);
        }
      }, 200);
    }
  };
  
  // We use tooltipInfo directly for the tooltip display
  
  // Get emoji size based on point size - kept for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getEmojiSize = (size: number): number => {
    // Base size is proportional to the point size
    return size * 1.5;
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
      {/* Container for the emojis that will be positioned absolutely */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Persistent points emojis */}
        {persistentPoints.map((point) => {
          const { x, y } = transformCoordinates(point.x, point.y);
          const isHovered = hoveredEmoji === point.id;
          
          // Calculate percentage position
          const xPercent = (x / width) * 100;
          const yPercent = (y / height) * 100;
          
          // Calculate scale based on hover state - will be used for future animations
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const scale = isHovered ? 1.5 : 1;
          
          return (
            <motion.div 
              key={`emoji-${point.id}`}
              title=""
              style={{ 
                position: 'absolute',
                left: `${xPercent}%`, 
                top: `${yPercent}%`,
                backgroundColor: point.color,
                width: `${point.size * 2.5}px`,
                height: `${point.size * 2.5}px`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                zIndex: 100
              }}
              initial={{ scale: 1, x: '-50%', y: '-50%' }}
              whileHover={{ scale: 1.5, x: '-50%', y: '-50%' }}
              animate={{ scale: hoveredEmoji === point.id ? 1.5 : 1, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => handleEmojiHover(point, true)}
              onMouseLeave={() => handleEmojiHover(point, false)}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{point.emoji}</span>
            </motion.div>
          );
        })}
        
        {/* Active point emoji with animation */}
        {currentPoint && !currentPoint.persistent && (() => {
          const { x, y } = transformCoordinates(currentPoint.x, currentPoint.y);
          
          // Calculate percentage position
          const xPercent = (x / width) * 100;
          const yPercent = (y / height) * 100;
          
          // Calculate scale based on active state - will be used for future animations
          const isActive = activeEmoji === currentPoint.id;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const scale = isActive ? 1.8 : 1;
          
          return (
            <motion.div 
              key={`active-emoji-${currentIndex}`}
              title=""
              style={{ 
                position: 'absolute',
                left: `${xPercent}%`, 
                top: `${yPercent}%`,
                backgroundColor: currentPoint.color,
                width: `${currentPoint.size * 2.5}px`,
                height: `${currentPoint.size * 2.5}px`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                zIndex: 100
              }}
              initial={{ scale: 1, x: '-50%', y: '-50%' }}
              whileHover={{ scale: 1.5, x: '-50%', y: '-50%' }}
              animate={{
                scale: animate ? [1, 1.8, 1] : 1,
                x: '-50%',
                y: '-50%'
              }}
              transition={{
                scale: {
                  duration: 0.8,
                  times: [0, 0.5, 1],
                  ease: 'easeInOut',
                  repeat: 0
                }
              }}
              onMouseEnter={() => handleEmojiHover(currentPoint, true)}
              onMouseLeave={() => handleEmojiHover(currentPoint, false)}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{currentPoint.emoji}</span>
            </motion.div>
          );
        })()}
      </div>
      
      {/* Tooltip that follows the hovered point */}
      <AnimatePresence>
        {tooltipInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={(() => {
              // Get the transformed coordinates of the point
              const { x, y } = transformCoordinates(tooltipInfo.x, tooltipInfo.y);
              
              // Convert to percentage for responsive positioning
              const xPercent = (x / width) * 100;
              const yPercent = (y / height) * 100;
              
              // Calculate tooltip position based on quadrant
              const tooltipStyle: React.CSSProperties = {
                position: 'absolute',
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(4px)',
                color: 'white',
                padding: '12px',
                borderRadius: '6px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                width: '200px',
                pointerEvents: 'none',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              };
              
              // Position tooltip based on which quadrant the point is in
              if (xPercent < 50) {
                // Left side of ice - position tooltip to the right of the point
                tooltipStyle.left = `calc(${xPercent}% + 20px)`;
              } else {
                // Right side of ice - position tooltip to the left of the point
                tooltipStyle.right = `calc(${100 - xPercent}% + 20px)`;
              }
              
              if (yPercent < 50) {
                // Top half of ice - position tooltip below the point
                tooltipStyle.top = `calc(${yPercent}% + 20px)`;
              } else {
                // Bottom half of ice - position tooltip above the point
                tooltipStyle.bottom = `calc(${100 - yPercent}% + 20px)`;
              }
              
              return tooltipStyle;
            })()}
          >
            {(() => {
              const details = formatEventDetails(tooltipInfo);
              
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', marginRight: '8px' }}>{tooltipInfo.emoji}</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{details.type}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                    <p style={{ margin: 0 }}>{details.period}</p>
                    <p style={{ margin: 0 }}>{details.time}</p>
                    <p style={{ margin: 0 }}>{details.coordinates}</p>
                    {details.details && (
                      <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 2px 0', fontSize: '12px' }}>Additional Details:</p>
                        <p style={{ fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{details.details}</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
      
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
            <circle
              key={`persistent-${point.id}`}
              cx={x}
              cy={y}
              r={point.size}
              fill={point.color}
              fillOpacity={0.6}
              stroke="white"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          );
        })}
        
        {/* Trail segments */}
        {trailSegments.map((segment) => (
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
                onMouseEnter={() => handleEmojiHover(currentPoint, true)}
                onMouseLeave={() => handleEmojiHover(currentPoint, false)}
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
              
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  scale: animate ? [1, 1.4, 1] : 1,
                  opacity: 1
                }}
                transition={{ 
                  scale: { 
                    duration: 0.5, 
                    times: [0, 0.5, 1],
                    ease: "easeInOut"
                  },
                  opacity: {
                    duration: 0.3,
                    ease: "easeInOut"
                  }
                }}
              />
              
              {/* Main data point circle */}
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
                    duration: 0.5, 
                    times: [0, 0.5, 1],
                    ease: "easeInOut"
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
      
      {/* We're now using the AnimatePresence tooltip above */}
      
      {plays.length > 0 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-3 z-10">
          {/* Animation controls */}
          <div className="flex items-center gap-2">
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
              {currentIndex !== null ? `${currentIndex + 1} / ${dataPoints.length}` : `0 / ${dataPoints.length}`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
