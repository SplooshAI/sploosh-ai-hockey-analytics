/**
 * Test postseason period formatting
 */

import { describe, it, expect } from 'vitest'
import { formatPeriodLabel } from './formatters'

describe('formatPeriodLabel - Postseason Handling', () => {
  const regularSeasonGameData = { gameType: 2 }
  const postseasonGameData = { gameType: 3 }

  describe('Regular Season Games', () => {
    it('should format regulation periods correctly', () => {
      expect(formatPeriodLabel(1, regularSeasonGameData)).toBe('1st')
      expect(formatPeriodLabel(2, regularSeasonGameData)).toBe('2nd')
      expect(formatPeriodLabel(3, regularSeasonGameData)).toBe('3rd')
    })

    it('should format overtime as "OT"', () => {
      expect(formatPeriodLabel(4, regularSeasonGameData)).toBe('OT')
    })

    it('should format period 5 as "SO" (shootout)', () => {
      expect(formatPeriodLabel(5, regularSeasonGameData)).toBe('SO')
    })

    it('should handle multiple overtimes (rare case)', () => {
      expect(formatPeriodLabel(6, regularSeasonGameData)).toBe('2OT')
      expect(formatPeriodLabel(7, regularSeasonGameData)).toBe('3OT')
    })
  })

  describe('Postseason Games', () => {
    it('should format regulation periods correctly', () => {
      expect(formatPeriodLabel(1, postseasonGameData)).toBe('1st')
      expect(formatPeriodLabel(2, postseasonGameData)).toBe('2nd')
      expect(formatPeriodLabel(3, postseasonGameData)).toBe('3rd')
    })

    it('should format overtime as "OT"', () => {
      expect(formatPeriodLabel(4, postseasonGameData)).toBe('OT')
    })

    it('should format period 5 as "2OT" (no shootouts in playoffs)', () => {
      expect(formatPeriodLabel(5, postseasonGameData)).toBe('2OT')
    })

    it('should format multiple overtimes correctly', () => {
      expect(formatPeriodLabel(6, postseasonGameData)).toBe('3OT')
      expect(formatPeriodLabel(7, postseasonGameData)).toBe('4OT')
    })
  })

  describe('Backward Compatibility', () => {
    it('should work without game data parameter', () => {
      expect(formatPeriodLabel(1)).toBe('1st')
      expect(formatPeriodLabel(4)).toBe('OT')
      expect(formatPeriodLabel(5)).toBe('SO') // Defaults to regular season behavior
    })
  })

  describe('Edge Cases', () => {
    it('should handle unexpected period numbers', () => {
      expect(formatPeriodLabel(0, postseasonGameData)).toBe('Period 0')
      expect(formatPeriodLabel(99, postseasonGameData)).toBe('Period 99')
    })
  })
})
