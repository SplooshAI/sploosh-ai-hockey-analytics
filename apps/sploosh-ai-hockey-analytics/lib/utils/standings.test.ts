import { describe, it, expect } from 'vitest'
import { formatRank, ordinal, standingsByTeam } from './standings'

const row = (abbrev: string, extra: Record<string, unknown> = {}) => ({
  teamAbbrev: { default: abbrev },
  divisionName: 'Pacific',
  conferenceAbbrev: 'W',
  divisionSequence: 3,
  conferenceSequence: 5,
  ...extra,
})

describe('standings', () => {
  it('formats division and conference rank', () => {
    const map = standingsByTeam({ standings: [row('SEA')] })
    expect(formatRank(map.SEA)).toBe('3rd in Pacific, 5th in West')
  })

  it('labels the Eastern conference', () => {
    const map = standingsByTeam({ standings: [row('NYR', { divisionName: 'Metropolitan', conferenceAbbrev: 'E', divisionSequence: 1, conferenceSequence: 1 })] })
    expect(formatRank(map.NYR)).toBe('1st in Metropolitan, 1st in East')
  })

  it('handles teen ordinals', () => {
    expect([11, 12, 13, 21, 22, 23].map(ordinal)).toEqual(['11th', '12th', '13th', '21st', '22nd', '23rd'])
  })

  it('skips rows with missing rank data and tolerates a missing response', () => {
    const map = standingsByTeam({ standings: [row('SEA', { conferenceSequence: undefined }), row('UTA')] })
    expect(map.SEA).toBeUndefined()
    expect(map.UTA).toBeDefined()
    expect(standingsByTeam(null)).toEqual({})
    expect(formatRank(undefined)).toBeUndefined()
  })
})
