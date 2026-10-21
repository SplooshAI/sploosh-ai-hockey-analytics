/**
 * Where an arena is: "Seattle, WA", "Vancouver, BC, Canada", "Helsinki, Finland".
 * The NHL feed only gives the arena's city, so the region comes from tables.
 */

import { describe, it, expect } from 'vitest'
import { formatVenueLocation } from './venue-location'

describe('formatVenueLocation', () => {
  it('shows the state for the neutral-site preseason arena in Greensboro', () => {
    expect(formatVenueLocation('First Horizon Coliseum', 'Greensboro')).toBe('Greensboro, NC')
  })

  it('shows city and state for US arenas', () => {
    expect(formatVenueLocation('Climate Pledge Arena', 'Seattle')).toBe('Seattle, WA')
    expect(formatVenueLocation('Lenovo Center', 'Raleigh')).toBe('Raleigh, NC')
  })

  it('shows city, province and country for Canadian arenas', () => {
    expect(formatVenueLocation('Rogers Arena', 'Vancouver')).toBe('Vancouver, BC, Canada')
    expect(formatVenueLocation('Centre Bell', 'Montreal')).toBe('Montreal, QC, Canada')
  })

  it('does not confuse Ontario, California with the province of Ontario', () => {
    expect(formatVenueLocation('Toyota Arena', 'Ontario')).toBe('Ontario, CA')
    expect(formatVenueLocation('Canadian Tire Centre', 'Ottawa')).toBe('Ottawa, ON, Canada')
    expect(formatVenueLocation('Some Stadium', 'Ontario')).toBe('Ontario')
  })

  it('uses the feed city for arenas that are not in the team\'s city', () => {
    expect(formatVenueLocation('UBS Arena', 'Elmont')).toBe('Elmont, NY')
    expect(formatVenueLocation('GIANT Center', 'Hershey')).toBe('Hershey, PA')
    expect(formatVenueLocation('Grand Casino Arena', 'St. Paul')).toBe('St. Paul, MN')
  })

  it('falls back to the NHL city for a special-event stadium', () => {
    expect(formatVenueLocation('Carter-Finley Stadium', 'Raleigh')).toBe('Raleigh, NC')
    expect(formatVenueLocation('BC Place', 'Vancouver')).toBe('Vancouver, BC, Canada')
  })

  it('shows city and country for neutral-site arenas abroad', () => {
    expect(formatVenueLocation('Veikkaus Arena', 'Helsinki')).toBe('Helsinki, Finland')
    expect(formatVenueLocation('Avicii Arena', 'Stockholm')).toBe('Stockholm, Sweden')
  })

  it('shows only the city for an unknown venue in an unknown city, never a guess', () => {
    expect(formatVenueLocation('Some New Arena', 'Springfield')).toBe('Springfield')
  })

  it('shows nothing without a city', () => {
    expect(formatVenueLocation('Rogers Arena', '')).toBe('')
    expect(formatVenueLocation('Rogers Arena', undefined)).toBe('')
  })
})
