/**
 * Call-out text for games that are not an ordinary home game: Global Series, Stadium Series,
 * Winter Classic and the like have a special event name in the NHL feed; other neutral-site
 * games only have the neutralSite flag.
 */

import { describe, it, expect } from 'vitest'
import { specialGameBadge, specialEventTheme, needsGeneratedBanner } from './special-game'

describe('specialGameBadge', () => {
  it('shows the event name for a special-event game', () => {
    expect(specialGameBadge({ specialEvent: { name: { default: '2026 NHL Global Series' } } })).toBe('2026 NHL Global Series')
    expect(specialGameBadge({ specialEvent: { name: { default: '2027 NHL Winter Classic' } }, neutralSite: true })).toBe('2027 NHL Winter Classic')
  })

  it('calls out a neutral-site game that has no event name', () => {
    expect(specialGameBadge({ neutralSite: true })).toBe('Neutral site')
  })

  it('has no badge for an ordinary game', () => {
    expect(specialGameBadge({})).toBe('')
    expect(specialGameBadge({ neutralSite: false, specialEvent: null })).toBe('')
    expect(specialGameBadge(undefined)).toBe('')
  })
})

describe('specialEventTheme', () => {
  it('gives each known event its own colors', () => {
    const themes = ['2026 NHL Global Series', '2026 Tim Hortons NHL Heritage Classic', '2027 Navy Federal Credit Union NHL Stadium Series', '2027 NHL Winter Classic']
      .map((n) => specialEventTheme({ specialEvent: { name: { default: n } } }).accent)
    expect(new Set(themes).size).toBe(4)
    expect(themes).not.toContain('#f59e0b')
  })

  it('stays amber for an unknown event and for a plain neutral-site game', () => {
    expect(specialEventTheme({ specialEvent: { name: { default: 'Some New Event' } } }).accent).toBe('#f59e0b')
    expect(specialEventTheme({ neutralSite: true }).accent).toBe('#f59e0b')
    expect(specialEventTheme(undefined).accent).toBe('#f59e0b')
  })
})

describe('needsGeneratedBanner', () => {
  it('is true for a named event with no artwork', () => {
    expect(needsGeneratedBanner({ specialEvent: { name: { default: 'Stadium Series' } } })).toBe(true)
  })

  it('is false when the feed has artwork, no event, or only a neutral-site flag', () => {
    expect(needsGeneratedBanner({ specialEvent: { name: { default: 'Global Series' }, lightLogoUrl: { default: 'https://x/y.svg' } } })).toBe(false)
    expect(needsGeneratedBanner({ neutralSite: true })).toBe(false)
    expect(needsGeneratedBanner({})).toBe(false)
  })
})
