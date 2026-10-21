/**
 * Call-out text for games that are not an ordinary home game: Global Series, Stadium Series,
 * Winter Classic and the like have a special event name in the NHL feed; other neutral-site
 * games only have the neutralSite flag.
 */

import { describe, it, expect } from 'vitest'
import { specialGameBadge } from './special-game'

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
