/**
 * Shootout handling: shootout attempts are not game shots or goals.
 * Only the game-winning shootout goal counts, as in the official score.
 */

import { describe, it, expect } from 'vitest'
import { excludeShootoutAttempts, getShootoutWinningGoalEventId, isShootoutPlay } from './shootout'
import { parseShotsFromEdge } from './shot-chart-utils'
import { regulationOnlyGame, shootoutGame, SO_WINNING_GOAL_EVENT_ID } from './shootout.fixture'

const goalsByTeam = (plays: any[], teamId: number) =>
  plays.filter((p) => p.typeDescKey === 'goal' && p.details.eventOwnerTeamId === teamId).length

describe('isShootoutPlay', () => {
  it('is true only for plays in the shootout period', () => {
    expect(isShootoutPlay({ periodDescriptor: { number: 5, periodType: 'SO' } })).toBe(true)
    expect(isShootoutPlay({ periodDescriptor: { number: 4, periodType: 'OT' } })).toBe(false)
    expect(isShootoutPlay({ periodDescriptor: { number: 1, periodType: 'REG' } })).toBe(false)
    expect(isShootoutPlay({})).toBe(false)
  })
})

describe('getShootoutWinningGoalEventId', () => {
  it("is the winner's goal that puts them one ahead of the other team's shootout goals", () => {
    expect(getShootoutWinningGoalEventId(shootoutGame)).toBe(SO_WINNING_GOAL_EVENT_ID)
  })

  it('is undefined for a game with no shootout', () => {
    expect(getShootoutWinningGoalEventId(regulationOnlyGame)).toBeUndefined()
  })

  it('is undefined while a shootout is still in progress', () => {
    expect(getShootoutWinningGoalEventId({ ...shootoutGame, gameState: 'LIVE' })).toBeUndefined()
  })
})

describe('excludeShootoutAttempts', () => {
  it('keeps every regular-season and overtime play untouched', () => {
    const kept = excludeShootoutAttempts(shootoutGame).plays.filter((p: any) => !isShootoutPlay(p))
    expect(kept).toHaveLength(regulationOnlyGame.plays.length)
  })

  it('keeps exactly one shootout play: the winning goal', () => {
    const so = excludeShootoutAttempts(shootoutGame).plays.filter(isShootoutPlay)
    expect(so).toHaveLength(1)
    expect(so[0].eventId).toBe(SO_WINNING_GOAL_EVENT_ID)
    expect(so[0].typeDescKey).toBe('goal')
  })

  it('drops all shootout plays while the shootout is still in progress', () => {
    const live = excludeShootoutAttempts({ ...shootoutGame, gameState: 'LIVE' })
    expect(live.plays.filter(isShootoutPlay)).toHaveLength(0)
  })

  it('returns a game with no shootout unchanged', () => {
    expect(excludeShootoutAttempts(regulationOnlyGame).plays).toEqual(regulationOnlyGame.plays)
  })

  it('does not modify the original game data', () => {
    const before = shootoutGame.plays.length
    excludeShootoutAttempts(shootoutGame)
    expect(shootoutGame.plays).toHaveLength(before)
  })
})

describe('parseShotsFromEdge with a shootout', () => {
  it('counts goals that match the official score: DET 3, SEA 4', () => {
    const shots = parseShotsFromEdge(shootoutGame)
    const goals = (teamId: number) => shots.filter((s) => s.result === 'goal' && s.teamId === teamId).length
    expect(goals(17)).toBe(shootoutGame.awayTeam.score)
    expect(goals(55)).toBe(shootoutGame.homeTeam.score)
  })

  it('does not plot shootout shots or the losing shootout goals', () => {
    const shots = parseShotsFromEdge(shootoutGame)
    const inShootout = shots.filter((s) => s.period === 5)
    expect(inShootout).toHaveLength(1)
    expect(inShootout[0].eventId).toBe(SO_WINNING_GOAL_EVENT_ID)
  })

  it('leaves a game without a shootout alone', () => {
    expect(goalsByTeam(regulationOnlyGame.plays, 17)).toBe(3)
    expect(parseShotsFromEdge(regulationOnlyGame).filter((s) => s.result === 'goal')).toHaveLength(6)
  })
})
