'use client'

import React, { useMemo, useState } from 'react'
import { Clock, AlertTriangle, Play, Target, Shield, XCircle, Circle, Users, Zap, StopCircle } from 'lucide-react'
import { formatPeriodLabel, formatSituationCode } from '@/lib/utils/formatters'
import Image from 'next/image'
import { RedLightIcon } from './red-light-icon'
import { VideoOverlay } from '../shot-chart/video-overlay'

interface GameTimelineProps {
   
  gameData: any
  className?: string
}

interface TimelineEvent {
  eventId: number
  type: string // Dynamic event type from typeDescKey
  period: number
  timeInPeriod: string
  timeRemaining: string
  teamId: number
  playerId?: number
  situationCode?: string
  highlightClipId?: number
  details: Record<string, any>  
}

function getPlayerName(playerId: number, rosterSpots: any[]): string {  
  const player = rosterSpots.find((spot: any) => spot.playerId === playerId)  
  if (!player) return 'Unknown'
  return `${player.firstName?.default || ''} ${player.lastName?.default || ''}`.trim()
}

function parseTimelineEvents(gameData: any): TimelineEvent[] {  
  const plays = gameData.plays || []
  const events: TimelineEvent[] = []

  plays.forEach((play: any) => {  
    // Skip plays without a typeDescKey
    if (!play.typeDescKey) return

    // Parse all event types dynamically
    const event: TimelineEvent = {
      eventId: play.eventId,
      type: play.typeDescKey,
      period: play.periodDescriptor?.number || 1,
      timeInPeriod: play.timeInPeriod,
      timeRemaining: play.timeRemaining,
      teamId: play.details?.eventOwnerTeamId,
      situationCode: play.situationCode,
      highlightClipId: play.details?.highlightClip,
      details: play.details || {},
    }

    // Set primary playerId based on event type
    if (play.typeDescKey === 'goal') {
      event.playerId = play.details?.scoringPlayerId
    } else if (play.typeDescKey === 'penalty') {
      event.playerId = play.details?.committedByPlayerId
    } else if (play.typeDescKey === 'shot-on-goal' || play.typeDescKey === 'missed-shot') {
      event.playerId = play.details?.shootingPlayerId
    } else if (play.typeDescKey === 'hit') {
      event.playerId = play.details?.hittingPlayerId
    } else if (play.typeDescKey === 'faceoff') {
      event.playerId = play.details?.winningPlayerId
    } else if (play.typeDescKey === 'takeaway' || play.typeDescKey === 'giveaway') {
      event.playerId = play.details?.playerId
    } else if (play.typeDescKey === 'blocked-shot') {
      event.playerId = play.details?.blockingPlayerId
    }

    events.push(event)
  })

  return events.sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period
    // Sort by time in period (convert MM:SS to seconds)
    const aSeconds = a.timeInPeriod.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
    const bSeconds = b.timeInPeriod.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
    return aSeconds - bSeconds
  })
}

// Helper function to get icon and color for event type
function getEventTypeConfig(type: string): { icon: React.ReactNode; color: string; bgColor: string; label: string } {
  const iconSize = 16
  const configs: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
    'goal': { icon: <RedLightIcon size={iconSize} />, color: 'text-red-500', bgColor: 'bg-red-500', label: 'Goals' },
    'penalty': { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-yellow-500', bgColor: 'bg-yellow-500', label: 'Penalties' },
    'shot-on-goal': { icon: <Target className="h-4 w-4" />, color: 'text-blue-500', bgColor: 'bg-blue-500', label: 'Shots on Goal' },
    'missed-shot': { icon: <XCircle className="h-4 w-4" />, color: 'text-gray-500', bgColor: 'bg-gray-500', label: 'Missed Shots' },
    'blocked-shot': { icon: <Shield className="h-4 w-4" />, color: 'text-purple-500', bgColor: 'bg-purple-500', label: 'Blocked Shots' },
    'hit': { icon: <Zap className="h-4 w-4" />, color: 'text-orange-500', bgColor: 'bg-orange-500', label: 'Hits' },
    'faceoff': { icon: <Circle className="h-4 w-4" />, color: 'text-cyan-500', bgColor: 'bg-cyan-500', label: 'Faceoffs' },
    'takeaway': { icon: <Users className="h-4 w-4" />, color: 'text-green-500', bgColor: 'bg-green-500', label: 'Takeaways' },
    'giveaway': { icon: <Users className="h-4 w-4" />, color: 'text-pink-500', bgColor: 'bg-pink-500', label: 'Giveaways' },
    'stoppage': { icon: <StopCircle className="h-4 w-4" />, color: 'text-slate-500', bgColor: 'bg-slate-500', label: 'Stoppages' },
  }
  
  return configs[type] || { 
    icon: <Circle className="h-4 w-4" />, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted', 
    label: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
  }
}

function renderEventDetails(
  event: TimelineEvent, 
  rosterSpots: any[],  
  teamLogo: string | undefined, 
  teamAbbrev: string,
  gameData: any,  
  setVideoOverlay: (overlay: { url: string; playerName: string; teamAbbrev?: string } | null) => void
) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {teamLogo && (
          <div className="relative w-6 h-6">
            <Image
              src={teamLogo}
              alt={teamAbbrev}
              fill
              className="object-contain"
            />
          </div>
        )}
        <span className="font-bold text-lg">
          {event.type.split('-').map(word => word.toUpperCase()).join(' ')} - {teamAbbrev}
        </span>
        
        {/* Show score for goals */}
        {event.type === 'goal' && (
          <>
            {(() => {
              const situation = formatSituationCode(event.situationCode)
              if (!situation || situation.type === 'even') return null
              
              // Check if this is a goalie pulled situation (empty net)
              // Situation code format: ABCD where A=away goalie, D=home goalie (1=in, 0=pulled)
              const situationCode = event.situationCode || ''
              if (situationCode.length === 4) {
                const awayGoalieIn = situationCode[0] === '1'
                const homeGoalieIn = situationCode[3] === '1'
                const isAwayTeam = event.teamId === gameData.awayTeam?.id
                
                // If ANY goalie is pulled, show ENG badge instead of PPG/SHG
                if (!awayGoalieIn || !homeGoalieIn) {
                  // Determine if it's an empty net goal or goal with own goalie pulled
                  const isEmptyNet = (isAwayTeam && !homeGoalieIn) || (!isAwayTeam && !awayGoalieIn)
                  
                  // Get team abbreviation for clarity
                  const scoringTeamAbbrev = isAwayTeam ? gameData.awayTeam?.abbrev : gameData.homeTeam?.abbrev
                  
                  // Different colors: cyan for empty net (icing on the cake), green for extra attacker (successful risky play)
                  const badgeColor = isEmptyNet ? 'bg-cyan-600' : 'bg-green-600'
                  
                  return (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${badgeColor} text-white`}>
                      {isEmptyNet ? 'ENG' : `ENG (${scoringTeamAbbrev} +1 skater)`}
                    </span>
                  )
                }
              }
              
              // Determine if this team scored on PP or SH
              const isAwayTeam = event.teamId === gameData.awayTeam?.id
              const awaySkaters = parseInt(event.situationCode?.[1] || '5')
              const homeSkaters = parseInt(event.situationCode?.[2] || '5')
              
              const isPowerPlay = isAwayTeam 
                ? awaySkaters > homeSkaters 
                : homeSkaters > awaySkaters
              
              return (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  isPowerPlay 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {isPowerPlay ? 'PPG' : 'SHG'}
                </span>
              )
            })()}
            <span className="text-muted-foreground">
              {event.details.awayScore} - {event.details.homeScore}
            </span>
          </>
        )}
      </div>
      
      {/* Event-specific details */}
      <div className="text-sm">
        {event.type === 'goal' && (
          <>
            <div>
              <span className="font-medium">Scored by:</span>{' '}
              {event.details.scoringPlayerId
                ? getPlayerName(event.details.scoringPlayerId, rosterSpots)
                : 'Unknown'}
              {event.details.scoringPlayerTotal && (
                <span className="text-muted-foreground">
                  {' '}({event.details.scoringPlayerTotal})
                </span>
              )}
            </div>
            {(event.details.assist1PlayerId || event.details.assist2PlayerId) && (
              <div>
                <span className="font-medium">Assists:</span>{' '}
                {[
                  event.details.assist1PlayerId
                    ? getPlayerName(event.details.assist1PlayerId, rosterSpots)
                    : null,
                  event.details.assist2PlayerId
                    ? getPlayerName(event.details.assist2PlayerId, rosterSpots)
                    : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
            {/* Watch Replay Button */}
            {event.highlightClipId && (
              <div className="mt-2">
                <button
                  onClick={() => {
                    const embedUrl = `https://players.brightcove.net/6415718365001/EXtG1xJ7H_default/index.html?videoId=${event.highlightClipId}`
                    const playerName = event.details.scoringPlayerId
                      ? getPlayerName(event.details.scoringPlayerId, rosterSpots)
                      : 'Unknown'
                    setVideoOverlay({
                      url: embedUrl,
                      playerName,
                      teamAbbrev,
                    })
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Play className="h-3 w-3" />
                  Watch Replay
                </button>
              </div>
            )}
          </>
        )}
        
        {event.type === 'penalty' && (
          <>
            <div>
              <span className="font-medium">Player:</span>{' '}
              {event.details.committedByPlayerId
                ? getPlayerName(event.details.committedByPlayerId, rosterSpots)
                : 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Type:</span>{' '}
              {event.details.descKey?.replace(/-/g, ' ').toUpperCase() || 'Unknown'}
              {event.details.duration && (
                <span className="text-muted-foreground">
                  {' '}({event.details.duration} min)
                </span>
              )}
            </div>
          </>
        )}
        
        {(event.type === 'shot-on-goal' || event.type === 'missed-shot') && (
          <>
            <div>
              <span className="font-medium">Shooter:</span>{' '}
              {event.details.shootingPlayerId
                ? getPlayerName(event.details.shootingPlayerId, rosterSpots)
                : 'Unknown'}
            </div>
            {event.details.shotType && (
              <div>
                <span className="font-medium">Shot Type:</span>{' '}
                {event.details.shotType}
              </div>
            )}
          </>
        )}
        
        {event.type === 'blocked-shot' && (
          <>
            <div>
              <span className="font-medium">Blocked by:</span>{' '}
              {event.details.blockingPlayerId
                ? getPlayerName(event.details.blockingPlayerId, rosterSpots)
                : 'Unknown'}
            </div>
            {event.details.shootingPlayerId && (
              <div>
                <span className="font-medium">Shooter:</span>{' '}
                {getPlayerName(event.details.shootingPlayerId, rosterSpots)}
              </div>
            )}
          </>
        )}
        
        {event.type === 'hit' && (
          <>
            <div>
              <span className="font-medium">Hitter:</span>{' '}
              {event.details.hittingPlayerId
                ? getPlayerName(event.details.hittingPlayerId, rosterSpots)
                : 'Unknown'}
            </div>
            {event.details.hitteePlayerId && (
              <div>
                <span className="font-medium">Hit on:</span>{' '}
                {getPlayerName(event.details.hitteePlayerId, rosterSpots)}
              </div>
            )}
          </>
        )}
        
        {event.type === 'faceoff' && (
          <>
            <div>
              <span className="font-medium">Won by:</span>{' '}
              {event.details.winningPlayerId
                ? getPlayerName(event.details.winningPlayerId, rosterSpots)
                : 'Unknown'}
            </div>
            {event.details.losingPlayerId && (
              <div>
                <span className="font-medium">Lost by:</span>{' '}
                {getPlayerName(event.details.losingPlayerId, rosterSpots)}
              </div>
            )}
          </>
        )}
        
        {(event.type === 'takeaway' || event.type === 'giveaway') && (
          <div>
            <span className="font-medium">Player:</span>{' '}
            {event.details.playerId
              ? getPlayerName(event.details.playerId, rosterSpots)
              : 'Unknown'}
          </div>
        )}
        
        {/* Generic fallback for other event types */}
        {!['goal', 'penalty', 'shot-on-goal', 'missed-shot', 'blocked-shot', 'hit', 'faceoff', 'takeaway', 'giveaway'].includes(event.type) && event.playerId && (
          <div>
            <span className="font-medium">Player:</span>{' '}
            {getPlayerName(event.playerId, rosterSpots)}
          </div>
        )}
      </div>
    </div>
  )
}

export function GameTimeline({ gameData, className = '' }: GameTimelineProps) {
  const events = useMemo(() => parseTimelineEvents(gameData), [gameData])
  
  // Load preferences from localStorage
  const loadPreferences = () => {
    if (typeof window === 'undefined') return null
    try {
      const saved = localStorage.getItem('gameTimelinePreferences')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load game timeline preferences:', error)
      return null
    }
  }

  const savedPrefs = loadPreferences()
  
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(undefined)
  
  // Get unique event types from the data, sorted alphabetically by label
  const availableEventTypes = useMemo(() => {
    const types = [...new Set(events.map(e => e.type))]
    return types.sort((a, b) => {
      const labelA = getEventTypeConfig(a).label
      const labelB = getEventTypeConfig(b).label
      return labelA.localeCompare(labelB)
    })
  }, [events])
  
  // Check if there are any goals in the game
  const hasGoals = useMemo(() => {
    return events.some(e => e.type === 'goal')
  }, [events])
  
  // Default to showing only goals if goals exist, otherwise show all events
  // Use saved preferences if they exist
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(() => {
    if (savedPrefs?.selectedEventTypes !== undefined) {
      return savedPrefs.selectedEventTypes
    }
    return hasGoals ? ['goal'] : availableEventTypes
  })
  
  // Video overlay state
  const [videoOverlay, setVideoOverlay] = useState<{
    url: string
    playerName: string
    teamAbbrev?: string
  } | null>(null)

  const periods = useMemo(() => {
    const uniquePeriods = [...new Set(events.map(e => e.period))].sort((a, b) => a - b)
    return uniquePeriods
  }, [events])

  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by period
    if (selectedPeriod !== undefined) {
      filtered = filtered.filter(e => e.period === selectedPeriod)
    }

    // Filter by event type
    if (selectedEventTypes.length > 0) {
      filtered = filtered.filter(e => selectedEventTypes.includes(e.type))
    }

    return filtered
  }, [events, selectedPeriod, selectedEventTypes])

  // Events filtered by period only (for summary stats)
  const periodFilteredEvents = useMemo(() => {
    if (selectedPeriod === undefined) {
      return events
    }
    return events.filter(e => e.period === selectedPeriod)
  }, [events, selectedPeriod])

  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Save preferences to localStorage whenever selectedEventTypes changes
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const preferences = {
        selectedEventTypes,
      }
      localStorage.setItem('gameTimelinePreferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save game timeline preferences:', error)
    }
  }, [selectedEventTypes])

  const rosterSpots = gameData.rosterSpots || []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Game Timeline</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredEvents.length} events
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Period Filter */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Period</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPeriod(undefined)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedPeriod === undefined
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              All Periods
            </button>
            {periods.map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {formatPeriodLabel(period)}
              </button>
            ))}
          </div>
        </div>

        {/* Event Type Filter - Dynamically Generated */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-muted-foreground">Event Type</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedEventTypes(availableEventTypes)
                }}
                className="px-2 py-1 text-xs rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => {
                  setSelectedEventTypes([])
                }}
                className="px-2 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableEventTypes.map(eventType => {
              const config = getEventTypeConfig(eventType)
              const count = selectedPeriod !== undefined
                ? events.filter(e => e.type === eventType && e.period === selectedPeriod).length
                : events.filter(e => e.type === eventType).length
              
              return (
                <button
                  key={eventType}
                  onClick={() => toggleEventType(eventType)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                    selectedEventTypes.includes(eventType)
                      ? `${config.bgColor} text-white`
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {config.icon}
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No events to display
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const team = event.teamId === gameData.awayTeam?.id
              ? gameData.awayTeam
              : gameData.homeTeam
            const teamLogo = team?.logo || team?.darkLogo
            const teamAbbrev = team?.abbrev || 'UNK'

            return (
              <div
                key={event.eventId}
                className="flex gap-4 items-start relative"
              >
                {/* Timeline line */}
                {index < filteredEvents.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  getEventTypeConfig(event.type).bgColor
                }/20 ${
                  getEventTypeConfig(event.type).color
                }`}>
                  <div className="scale-150">
                    {getEventTypeConfig(event.type).icon}
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 bg-card rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Time and Period */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="font-medium">{formatPeriodLabel(event.period)}</span>
                        <span>•</span>
                        <span>{event.timeInPeriod} ({event.timeRemaining} remaining)</span>
                      </div>

                      {/* Event Type and Details */}
                      {renderEventDetails(event, rosterSpots, teamLogo, teamAbbrev, gameData, setVideoOverlay)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats - Dynamic */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-4 border-t border-border">
        {availableEventTypes.map(eventType => {
          const config = getEventTypeConfig(eventType)
          const count = periodFilteredEvents.filter(e => e.type === eventType).length
          
          return (
            <div key={eventType} className="bg-card rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${config.color}`}>
                {count}
              </div>
              <div className="text-sm text-muted-foreground">
                {config.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Video Overlay */}
      {videoOverlay && (
        <VideoOverlay
          videoUrl={videoOverlay.url}
          playerName={videoOverlay.playerName}
          teamAbbrev={videoOverlay.teamAbbrev}
          onClose={() => setVideoOverlay(null)}
        />
      )}
    </div>
  )
}
