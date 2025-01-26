export interface NHLEdgeGame {
    awayTeam: NHLEdgeTeam
    clock?: {
        inIntermission: boolean
        timeRemaining: string
    }
    gameCenterLink: string
    gameDate: string
    gameScheduleState: string
    gameState: NHLEdgeGameState
    gameType: number
    homeTeam: NHLEdgeTeam
    id: number
    period?: number
    periodDescriptor?: {
        number: number
        periodType: NHLEdgePeriodType
        maxRegulationPeriods: number
    }
    season: number
    startTimeUTC: string
    specialEvent?: {
        parentId: number
        name: {
            default: string
            fr?: string
        }
        lightLogoUrl: {
            default: string
            fr?: string
        }
    }
    matchup?: NHLEdgeMatchup
}

export type NHLEdgePeriodType = 'REG' | 'OT' | 'SO'

export interface NHLEdgeGameWeekDay {
    date: string
    dayAbbrev: string
    numberOfGames: number
}

export type NHLEdgeGameState = 'LIVE' | 'FUT' | 'PRE' | 'CRIT' | 'FINAL' | 'OFF'

export interface NHLEdgeScheduleResponse {
    currentDate: string
    gameWeek: NHLEdgeGameWeekDay[]
    games: NHLEdgeGame[]
    nextDate: string
    prevDate: string
}

export interface NHLEdgeTeam {
    id: number
    commonName: {
        default: string
    }
    abbrev: string
    score?: number
    sog?: number
    record?: string
    logo: string
    darkLogo: string
    placeName: {
        default: string
    }
}

// Play-by-play types
export interface NHLEdgePlayByPlay {
    id: number
    gameDate: string
    gameId: number
    plays: NHLEdgePlay[]
    periodDescriptor: NHLEdgePeriodDescriptor[]
    rosterSpots: NHLEdgeRosterSpot[]
    gameState: string
    gameType: number
    season: number
    awayTeam: { abbrev: string }
    homeTeam: { abbrev: string }
}

export interface NHLEdgePlay {
    eventId: number
    period: number
    timeInPeriod: string
    timeRemaining: string
    situationCode: string
    typeCode: string
    typeDescKey: string
    details: Record<string, unknown>
    coordinates?: {
        x: number
        y: number
    }
}

export interface NHLEdgePeriodDescriptor {
    id: number
    periodType: string
    ordinalNum: string
    abbreviation: string
}

export interface NHLEdgeRosterSpot {
    id: number
    teamId: number
    playerId: number
    firstName: string
    lastName: string
    jerseyNumber: string
    position: string
}

export interface NHLEdgeMatchup {
    season: number
    gameType: number
    skaterComparison: {
        contextLabel: string
        contextSeason: number
        leaders: Array<{
            category: string
            awayLeader: NHLEdgeSkaterLeader
            homeLeader: NHLEdgeSkaterLeader
        }>
    }
    goalieComparison: {
        contextLabel: string
        contextSeason: number
        homeTeam: NHLEdgeGoalieStats
        awayTeam: NHLEdgeGoalieStats
    }
    skaterSeasonStats: {
        contextLabel: string
        contextSeason: number
        skaters: NHLEdgeSkaterStats[]
    }
    goalieSeasonStats: {
        contextLabel: string
        contextSeason: number
        goalies: NHLEdgeGoalieStats[]
    }
}

interface NHLEdgeSkaterLeader {
    playerId: number
    name: {
        default: string
    }
    firstName: {
        default: string
    }
    lastName: {
        default: string
    }
    sweaterNumber: number
    positionCode: string
    headshot: string
    value: number
}

export interface NHLEdgeGoalieStats {
    [key: string]: unknown
}

export interface NHLEdgeSkaterStats {
    [key: string]: unknown
} 