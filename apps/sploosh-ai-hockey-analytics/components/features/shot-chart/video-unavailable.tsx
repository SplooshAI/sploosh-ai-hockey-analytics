/**
 * VideoUnavailable - Fun animated fallback when NHL video is not ready
 */

'use client'

import * as React from 'react'

export const VideoUnavailable: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      {/* Animated Popcorn and Soda */}
      <div className="flex items-end gap-8 mb-8">
        {/* Popcorn */}
        <div className="relative animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
          <svg
            width="80"
            height="100"
            viewBox="0 0 80 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Popcorn container */}
            <path
              d="M20 40 L15 95 C15 97 17 100 20 100 L60 100 C63 100 65 97 65 95 L60 40 Z"
              fill="#FF4444"
              stroke="#CC0000"
              strokeWidth="2"
            />
            {/* Red and white stripes */}
            <path d="M22 50 L58 50 L56 65 L24 65 Z" fill="white" opacity="0.9" />
            <path d="M24 70 L56 70 L54 85 L26 85 Z" fill="white" opacity="0.9" />
            
            {/* Popcorn pieces */}
            <circle cx="30" cy="25" r="8" fill="#FFEB99" />
            <circle cx="35" cy="18" r="7" fill="#FFF4CC" />
            <circle cx="42" cy="22" r="8" fill="#FFEB99" />
            <circle cx="50" cy="20" r="7" fill="#FFF4CC" />
            <circle cx="45" cy="30" r="7" fill="#FFEB99" />
            <circle cx="38" cy="32" r="6" fill="#FFF4CC" />
            <circle cx="52" cy="28" r="6" fill="#FFEB99" />
            <circle cx="28" cy="32" r="6" fill="#FFF4CC" />
          </svg>
        </div>

        {/* Soda Cup */}
        <div className="relative animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>
          <svg
            width="70"
            height="110"
            viewBox="0 0 70 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* Cup */}
            <path
              d="M20 30 L15 100 C15 105 18 108 23 108 L47 108 C52 108 55 105 55 100 L50 30 Z"
              fill="#FF4444"
              stroke="#CC0000"
              strokeWidth="2"
            />
            {/* Logo circle */}
            <circle cx="35" cy="60" r="15" fill="white" opacity="0.9" />
            <text x="35" y="67" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#FF4444">
              NHL
            </text>
            
            {/* Straw */}
            <rect
              x="42"
              y="5"
              width="6"
              height="35"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="1"
              rx="3"
            />
            
            {/* Lid */}
            <ellipse cx="35" cy="30" rx="20" ry="5" fill="#CC0000" />
            <ellipse cx="35" cy="28" rx="20" ry="4" fill="#FF4444" />
            
            {/* Bubbles in straw */}
            <circle cx="45" cy="15" r="2" fill="white" opacity="0.6" className="animate-ping" style={{ animationDuration: '1.5s' }} />
            <circle cx="45" cy="22" r="2" fill="white" opacity="0.6" className="animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }} />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-2xl font-bold text-white">
          Video Not Ready Yet! 🎬
        </h3>
        <p className="text-slate-300 text-base leading-relaxed">
          The NHL is still preparing this highlight. Check back soon to watch the replay!
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full text-sm text-slate-400">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing highlight...
          </div>
        </div>
      </div>
    </div>
  )
}
