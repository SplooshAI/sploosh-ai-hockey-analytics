import { describe, it, expect } from 'vitest'
import { applyResult, resolveGameRecords } from './game-records'
import type { TeamStanding } from './standings'

const standing = (record: string, gamesPlayed: number, divisionSequence = 3): TeamStanding => ({
  record, gamesPlayed, divisionName: 'Pacific', conferenceAbbrev: 'W', divisionSequence, conferenceSequence: 5, wildcardSequence: 0,
})

const game = { awayAbbrev: 'UTA', homeAbbrev: 'SEA', awayFeedRecord: '7-3-0', homeFeedRecord: '6-3-1' }
const before = { UTA: standing('7-3-0', 10, 1), SEA: standing('6-3-1', 10) }

describe('applyResult', () => {
  it('adds a W for a win, an L for a regulation loss, and an OTL for an overtime or shootout loss', () => {
    expect(applyResult('6-3-1', true)).toBe('7-3-1')
    expect(applyResult('6-3-1', false, 'REG')).toBe('6-4-1')
    expect(applyResult('6-3-1', false, 'OT')).toBe('6-3-2')
    expect(applyResult('6-3-1', false, 'SO')).toBe('6-3-2')
  })
})

describe('resolveGameRecords', () => {
  it('shows the going-in record and rank before the game and while it is live', () => {
    for (const gameState of ['FUT', 'PRE', 'LIVE', 'CRIT']) {
      const { away, home } = resolveGameRecords({ ...game, gameState, awayScore: 2, homeScore: 1 }, before)
      expect(away).toEqual({ record: '7-3-0', rank: '1st in Pacific, 5th in West' })
      expect(home.record).toBe('6-3-1')
    }
  })

  it('falls back to the scores-feed record when the standings have no entry', () => {
    const { away, home } = resolveGameRecords({ ...game, gameState: 'FUT' }, {})
    expect(away).toEqual({ record: '7-3-0', rank: undefined })
    expect(home.record).toBe('6-3-1')
  })

  it('uses the standings that include the result once the game is final', () => {
    const after = { UTA: standing('7-4-0', 11, 2), SEA: standing('7-3-1', 11, 2) }
    const { away, home } = resolveGameRecords({ ...game, gameState: 'OFF', awayScore: 1, homeScore: 3, lastPeriodType: 'REG' }, before, after)
    expect(away).toEqual({ record: '7-4-0', rank: '2nd in Pacific, 5th in West' })
    expect(home.record).toBe('7-3-1')
  })

  it('applies the result itself, without a stale rank, when the standings have not counted the game yet', () => {
    const { away, home } = resolveGameRecords({ ...game, gameState: 'FINAL', awayScore: 4, homeScore: 3, lastPeriodType: 'OT' }, before, before)
    expect(away).toEqual({ record: '8-3-0', rank: undefined })
    expect(home).toEqual({ record: '6-3-2', rank: undefined })
  })

  it('credits a shootout loss as an OTL and a regulation loss as an L', () => {
    expect(resolveGameRecords({ ...game, gameState: 'OFF', awayScore: 2, homeScore: 3, lastPeriodType: 'SO' }, before).away.record).toBe('7-3-1')
    expect(resolveGameRecords({ ...game, gameState: 'OFF', awayScore: 2, homeScore: 3, lastPeriodType: 'REG' }, before).away.record).toBe('7-4-0')
  })
})
