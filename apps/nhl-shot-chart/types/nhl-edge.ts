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
    season: number
    startTimeUTC: string
}

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
    abbrev: string
    id: number
    name: string
    score?: number
} 