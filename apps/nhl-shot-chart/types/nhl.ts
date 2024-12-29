export interface NHLScheduleResponse {
    prevDate: string
    currentDate: string
    nextDate: string
    gameWeek: GameWeekDay[]
    games: NHLGame[]
}

export interface GameWeekDay {
    date: string
    dayAbbrev: string
    numberOfGames: number
}

export interface NHLGame {
    id: number
    season: number
    gameType: number
    gameDate: string
    startTimeUTC: string
    gameState: 'LIVE' | 'FUT' | 'PRE' | 'CRIT' | 'FINAL' | 'OFF'
    gameScheduleState: string
    awayTeam: NHLTeam
    homeTeam: NHLTeam
    gameCenterLink: string
    period?: number
    clock?: {
        timeRemaining: string
        inIntermission: boolean
    }
}

export interface NHLTeam {
    id: number
    name: string
    abbrev: string
    score?: number
} 