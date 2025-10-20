/**
 * RedLightIcon - Animated red goal light for hockey goals
 * Mimics the flashing red light behind the net when a goal is scored
 */

interface RedLightIconProps {
  className?: string
  size?: number
}

export function RedLightIcon({ className = '', size = 24 }: RedLightIconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow - pulsing */}
      <div 
        className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping"
        style={{ animationDuration: '1s' }}
      />
      
      {/* Main light - solid */}
      <div className="absolute inset-0 rounded-full bg-red-500" />
      
      {/* Inner highlight - pulsing */}
      <div 
        className="absolute inset-[20%] rounded-full bg-red-300 animate-pulse"
        style={{ animationDuration: '1s' }}
      />
      
      {/* Center bright spot */}
      <div className="absolute inset-[35%] rounded-full bg-white opacity-80" />
    </div>
  )
}
