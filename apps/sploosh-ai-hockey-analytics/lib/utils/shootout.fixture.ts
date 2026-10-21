/**
 * A finished game decided in a shootout, shaped like the NHL play-by-play feed.
 * Modeled on DET 3 @ SEA 4 (SO), 2026-10-20 (game 2026020149): 3-3 after
 * regulation, then a shootout where SEA scored twice and DET once. The official
 * score credits SEA with exactly one shootout goal: the one that wins the game.
 */
const DET = 17
const SEA = 55

type Play = Record<string, any>

const reg = (eventId: number, period: number, time: string, typeDescKey: string, team: number): Play => ({
  eventId,
  typeDescKey,
  periodDescriptor: { number: period, periodType: 'REG' },
  timeInPeriod: time,
  timeRemaining: '10:00',
  details: { eventOwnerTeamId: team, xCoord: team === SEA ? 70 : -70, yCoord: 3, scoringPlayerId: eventId, shootingPlayerId: eventId },
})

const so = (eventId: number, typeDescKey: string, team: number): Play => ({
  eventId,
  typeDescKey,
  periodDescriptor: { number: 5, periodType: 'SO' },
  timeInPeriod: '00:00',
  timeRemaining: '00:00',
  details: { eventOwnerTeamId: team, xCoord: team === SEA ? 80 : -80, yCoord: 0, scoringPlayerId: eventId, shootingPlayerId: eventId },
})

export const SO_GAME_ID = 2026020149
export const SO_WINNING_GOAL_EVENT_ID = 107

export const shootoutGame = {
  id: SO_GAME_ID,
  gameState: 'OFF',
  gameOutcome: { lastPeriodType: 'SO' },
  periodDescriptor: { number: 5, periodType: 'SO' },
  awayTeam: { id: DET, abbrev: 'DET', score: 3, sog: 25, commonName: { default: 'Red Wings' }, placeName: { default: 'Detroit' } },
  homeTeam: { id: SEA, abbrev: 'SEA', score: 4, sog: 27, commonName: { default: 'Kraken' }, placeName: { default: 'Seattle' } },
  rosterSpots: [],
  plays: [
    // 3-3 after regulation
    reg(1, 1, '05:00', 'goal', SEA),
    reg(2, 2, '03:00', 'goal', DET),
    reg(3, 2, '09:00', 'goal', SEA),
    reg(4, 2, '15:00', 'goal', DET),
    reg(5, 3, '04:00', 'goal', SEA),
    reg(6, 3, '18:00', 'goal', DET),
    reg(20, 1, '08:00', 'shot-on-goal', SEA),
    reg(21, 1, '12:00', 'missed-shot', DET),
    // shootout: SEA shoots at home, DET away; SEA scores in rounds 1 and 3, DET in round 2
    so(100, 'shot-on-goal', SEA),
    so(101, 'shot-on-goal', DET),
    so(102, 'shot-on-goal', SEA),
    so(103, 'shot-on-goal', DET),
    so(105, 'goal', SEA),
    so(106, 'goal', DET),
    so(107, 'goal', SEA), // the clincher: SEA's 2nd shootout goal, one more than DET's 1
    so(108, 'shot-on-goal', DET),
  ],
}

export const regulationOnlyGame = {
  ...shootoutGame,
  gameState: 'OFF',
  gameOutcome: { lastPeriodType: 'REG' },
  periodDescriptor: { number: 3, periodType: 'REG' },
  awayTeam: { ...shootoutGame.awayTeam, score: 3 },
  homeTeam: { ...shootoutGame.homeTeam, score: 3 },
  plays: shootoutGame.plays.filter((p) => p.periodDescriptor.periodType !== 'SO'),
}
