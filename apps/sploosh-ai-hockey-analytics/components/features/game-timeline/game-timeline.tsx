'use client'

import { useMemo, useState } from 'react'
import { Clock, AlertTriangle, Play } from 'lucide-react'
import { formatPeriodLabel, formatSituationCode } from '@/lib/utils/formatters'
import Image from 'next/image'
import { RedLightIcon } from './red-light-icon'
import { VideoOverlay } from '../shot-chart/video-overlay'

interface GameTimelineProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gameData: any
  className?: string
}

interface TimelineEvent {
  eventId: number
  type: 'goal' | 'penalty'
  period: number
  timeInPeriod: string
  timeRemaining: string
  teamId: number
  playerId?: number
  situationCode?: string
  highlightClipId?: number
  details: {
    scoringPlayerId?: number
    scoringPlayerTotal?: number
    assist1PlayerId?: number
    assist2PlayerId?: number
    awayScore?: number
    homeScore?: number
    committedByPlayerId?: number
    typeCode?: string
    descKey?: string
    duration?: number
  }
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
    if (play.typeDescKey === 'goal') {
      events.push({
        eventId: play.eventId,
        type: 'goal',
        period: play.periodDescriptor?.number || 1,
        timeInPeriod: play.timeInPeriod,
        timeRemaining: play.timeRemaining,
        teamId: play.details?.eventOwnerTeamId,
        playerId: play.details?.scoringPlayerId,
        situationCode: play.situationCode,
        highlightClipId: play.details?.highlightClip,
        details: {
          scoringPlayerId: play.details?.scoringPlayerId,
          scoringPlayerTotal: play.details?.scoringPlayerTotal,
          assist1PlayerId: play.details?.assist1PlayerId,
          assist2PlayerId: play.details?.assist2PlayerId,
          awayScore: play.details?.awayScore,
          homeScore: play.details?.homeScore,
        },
      })
    } else if (play.typeDescKey === 'penalty') {
      events.push({
        eventId: play.eventId,
        type: 'penalty',
        period: play.periodDescriptor?.number || 1,
        timeInPeriod: play.timeInPeriod,
        timeRemaining: play.timeRemaining,
        teamId: play.details?.eventOwnerTeamId,
        playerId: play.details?.committedByPlayerId,
        details: {
          committedByPlayerId: play.details?.committedByPlayerId,
          typeCode: play.details?.typeCode,
          descKey: play.details?.descKey,
          duration: play.details?.duration,
        },
      })
    }
  })

  return events.sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period
    // Sort by time in period (convert MM:SS to seconds)
    const aSeconds = a.timeInPeriod.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
    const bSeconds = b.timeInPeriod.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
    return aSeconds - bSeconds
  })
}

export function GameTimeline({ gameData, className = '' }: GameTimelineProps) {
  const events = useMemo(() => parseTimelineEvents(gameData), [gameData])
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>(undefined)
  const [selectedEventTypes, setSelectedEventTypes] = useState<Array<'goal' | 'penalty'>>(['goal', 'penalty'])
  
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

  const toggleEventType = (type: 'goal' | 'penalty') => {
    setSelectedEventTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

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

        {/* Event Type Filter */}
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-2">Event Type</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleEventType('goal')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                selectedEventTypes.includes('goal')
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <RedLightIcon size={16} />
              Goals ({
                selectedPeriod !== undefined
                  ? events.filter(e => e.type === 'goal' && e.period === selectedPeriod).length
                  : events.filter(e => e.type === 'goal').length
              })
            </button>
            <button
              onClick={() => toggleEventType('penalty')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                selectedEventTypes.includes('penalty')
                  ? 'bg-yellow-500 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Penalties ({
                selectedPeriod !== undefined
                  ? events.filter(e => e.type === 'penalty' && e.period === selectedPeriod).length
                  : events.filter(e => e.type === 'penalty').length
              })
            </button>
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
                  event.type === 'goal'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {event.type === 'goal' ? (
                    <RedLightIcon size={24} />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
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
                      {event.type === 'goal' && (
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
                            <span className="font-bold text-lg">GOAL - {teamAbbrev}</span>
                            {(() => {
                              const situation = formatSituationCode(event.situationCode)
                              if (!situation || situation.type === 'even') return null
                              
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
                          </div>
                          <div className="text-sm">
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
                          </div>
                        </div>
                      )}

                      {event.type === 'penalty' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
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
                            <span className="font-bold text-lg">PENALTY - {teamAbbrev}</span>
                          </div>
                          <div className="text-sm">
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
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-500">
            {periodFilteredEvents.filter(e => e.type === 'goal').length}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedPeriod !== undefined ? 'Goals' : 'Total Goals'}
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-500">
            {periodFilteredEvents.filter(e => e.type === 'penalty').length}
          </div>
          <div className="text-sm text-muted-foreground">
            {selectedPeriod !== undefined ? 'Penalties' : 'Total Penalties'}
          </div>
        </div>
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
