import { formatRank, type TeamStanding } from '@/lib/utils/standings'

export interface GameRecordInput {
  gameState: string
  awayAbbrev: string
  homeAbbrev: string
  awayScore?: number
  homeScore?: number
  /** REG, OT or SO: how the game ended; only read once it is final. */
  lastPeriodType?: string
  /** Records from the scores feed, used when the standings have nothing for a team. */
  awayFeedRecord?: string
  homeFeedRecord?: string
}

export interface TeamRecordInfo {
  record?: string
  rank?: string
}

export const isFinalState = (gameState: string): boolean => gameState === 'FINAL' || gameState === 'OFF'

/** Add one game's result to a W-L-OTL record: a win adds a W, a loss an L, an overtime or shootout loss an OTL. */
export function applyResult(record: string, won: boolean, lastPeriodType?: string): string {
  const [w, l, otl] = record.split('-').map((n) => Number.parseInt(n, 10) || 0)
  if (won) return `${w + 1}-${l}-${otl}`
  return lastPeriodType === 'OT' || lastPeriodType === 'SO' ? `${w}-${l}-${otl + 1}` : `${w}-${l + 1}-${otl}`
}

/**
 * The record and rank to show for both teams of a game.
 *
 * Before the game and while it is live, a team shows the record it took in, from the standings of the day
 * before. Once the game is final it shows the record after the game: the standings dated the game day
 * (they include that day's results) when the NHL has already counted the game, otherwise the going-in
 * record plus this game's result with no rank, since the going-in rank would be out of date.
 */
export function resolveGameRecords(
  game: GameRecordInput,
  before: Record<string, TeamStanding>,
  after: Record<string, TeamStanding> = {},
): { away: TeamRecordInfo; home: TeamRecordInfo } {
  const final = isFinalState(game.gameState)
  const hasScores = typeof game.awayScore === 'number' && typeof game.homeScore === 'number' && game.awayScore !== game.homeScore

  const forTeam = (abbrev: string, feedRecord: string | undefined, won: boolean | undefined): TeamRecordInfo => {
    const going = before[abbrev]
    if (!final) return { record: going?.record || feedRecord, rank: formatRank(going) }
    const done = after[abbrev]
    if (done && (!going || done.gamesPlayed === going.gamesPlayed + 1)) return { record: done.record, rank: formatRank(done) }
    if (going && won !== undefined) return { record: applyResult(going.record, won, game.lastPeriodType) }
    return { record: going?.record || feedRecord, rank: undefined }
  }

  const awayWon = hasScores ? game.awayScore! > game.homeScore! : undefined
  return {
    away: forTeam(game.awayAbbrev, game.awayFeedRecord, awayWon),
    home: forTeam(game.homeAbbrev, game.homeFeedRecord, awayWon === undefined ? undefined : !awayWon),
  }
}
