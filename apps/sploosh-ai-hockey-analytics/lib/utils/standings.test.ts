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

  describe('wild card', () => {
    const west = [
      row('COL', { divisionName: 'Central', divisionSequence: 4, conferenceSequence: 7, wildcardSequence: 1, points: 11 }),
      row('SJS', { divisionName: 'Pacific', divisionSequence: 4, conferenceSequence: 8, wildcardSequence: 2, points: 11 }),
      row('WPG', { divisionName: 'Central', divisionSequence: 5, conferenceSequence: 9, wildcardSequence: 3, points: 10 }),
      row('NSH', { divisionName: 'Central', divisionSequence: 6, conferenceSequence: 10, wildcardSequence: 4, points: 9 }),
      row('STL', { divisionName: 'Central', divisionSequence: 7, conferenceSequence: 11, wildcardSequence: 5, points: 11 }),
      row('SEA', { wildcardSequence: 0, points: 13 }),
    ]
    const map = standingsByTeam({ standings: west })

    it('marks wild card spots', () => {
      expect(formatRank(map.COL)).toBe('4th in Central, 7th in West (WC1)')
      expect(formatRank(map.SJS)).toBe('4th in Pacific, 8th in West (WC2)')
    })

    it('shows spots and points behind for teams outside the race', () => {
      expect(formatRank(map.WPG)).toBe('5th in Central, 9th in West (1 spot, 1 pt behind WC2)')
      expect(formatRank(map.NSH)).toBe('6th in Central, 10th in West (2 spots, 2 pts behind WC2)')
    })

    it('says level on points when a team trails only on tiebreakers', () => {
      expect(formatRank(map.STL)).toBe('7th in Central, 11th in West (3 spots behind WC2, level on points)')
    })

    it('adds nothing for a divisional playoff spot', () => {
      expect(formatRank(map.SEA)).toBe('3rd in Pacific, 5th in West')
    })

    it('omits points when no second wild card team is listed', () => {
      const lone = standingsByTeam({ standings: [row('WPG', { wildcardSequence: 3, points: 10 })] })
      expect(formatRank(lone.WPG)).toBe('3rd in Pacific, 5th in West (1 spot behind WC2)')
    })
  })
})
