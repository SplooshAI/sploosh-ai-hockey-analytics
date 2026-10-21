// Run with: node --test scripts/social-gif/venue-location.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { formatVenueLocation } from './venue-location.mjs'

test('US arenas show city and state', () => {
  assert.equal(formatVenueLocation('Climate Pledge Arena', 'Seattle'), 'Seattle, WA')
  assert.equal(formatVenueLocation('Lenovo Center', 'Raleigh'), 'Raleigh, NC')
})

test('Canadian arenas show city, province and country', () => {
  assert.equal(formatVenueLocation('Rogers Arena', 'Vancouver'), 'Vancouver, BC, Canada')
  assert.equal(formatVenueLocation('Centre Bell', 'Montreal'), 'Montreal, QC, Canada')
  assert.equal(formatVenueLocation('Scotiabank Saddledome', 'Calgary'), 'Calgary, AB, Canada')
})

test('Ontario, California is not confused with the province of Ontario', () => {
  assert.equal(formatVenueLocation('Toyota Arena', 'Ontario'), 'Ontario, CA')
  assert.equal(formatVenueLocation('Canadian Tire Centre', 'Ottawa'), 'Ottawa, ON, Canada')
})

test('arenas whose city differs from the team name use the feed city', () => {
  assert.equal(formatVenueLocation('UBS Arena', 'Elmont'), 'Elmont, NY')
  assert.equal(formatVenueLocation('GIANT Center', 'Hershey'), 'Hershey, PA')
  assert.equal(formatVenueLocation('T-Mobile Arena', 'Paradise'), 'Paradise, NV')
  assert.equal(formatVenueLocation('Grand Casino Arena', 'St. Paul'), 'St. Paul, MN')
})

test('other countries show city and country', () => {
  assert.equal(formatVenueLocation('Avicii Arena', 'Stockholm'), 'Stockholm, Sweden')
  assert.equal(formatVenueLocation('O2 Arena', 'Prague'), 'Prague, Czechia')
})

test('an unknown venue in an unknown city shows only the city, never a guess', () => {
  assert.equal(formatVenueLocation('Some New Arena', 'Springfield'), 'Springfield')
})

test('the neutral-site preseason arena in Greensboro is in North Carolina', () => {
  assert.equal(formatVenueLocation('First Horizon Coliseum', 'Greensboro'), 'Greensboro, NC')
})

test('no city means no location', () => {
  assert.equal(formatVenueLocation('Rogers Arena', ''), '')
  assert.equal(formatVenueLocation('Rogers Arena', undefined), '')
})

test('every NHL arena in the feed gets a city and region', () => {
  const arenas = [
    ['Honda Center', 'Anaheim'], ['TD Garden', 'Boston'], ['KeyBank Center', 'Buffalo'], ['Scotiabank Saddledome', 'Calgary'],
    ['Lenovo Center', 'Raleigh'], ['United Center', 'Chicago'], ['Ball Arena', 'Denver'], ['Nationwide Arena', 'Columbus'],
    ['American Airlines Center', 'Dallas'], ['Little Caesars Arena', 'Detroit'], ['Rogers Place', 'Edmonton'], ['Amerant Bank Arena', 'Sunrise'],
    ['Toyota Arena', 'Ontario'], ['Grand Casino Arena', 'St. Paul'], ['Centre Bell', 'Montreal'], ['Bridgestone Arena', 'Nashville'],
    ['Prudential Center', 'Newark'], ['UBS Arena', 'Elmont'], ['Madison Square Garden', 'New York'], ['Canadian Tire Centre', 'Ottawa'],
    ['Xfinity Mobile Arena', 'Philadelphia'], ['PPG Paints Arena', 'Pittsburgh'], ['SAP Center at San Jose', 'San Jose'], ['Climate Pledge Arena', 'Seattle'],
    ['Enterprise Center', 'St. Louis'], ['Benchmark International Arena', 'Tampa'], ['Scotiabank Arena', 'Toronto'], ['Delta Center', 'Salt Lake City'],
    ['Rogers Arena', 'Vancouver'], ['T-Mobile Arena', 'Paradise'], ['GIANT Center', 'Hershey'], ['Canada Life Centre', 'Winnipeg'],
  ]
  assert.equal(arenas.length, 32)
  for (const [venue, city] of arenas) {
    const out = formatVenueLocation(venue, city)
    assert.ok(out.startsWith(`${city}, `), `${venue}: ${out}`)
  }
})

test('a special-event venue in a known NHL city falls back to that city\'s region', () => {
  assert.equal(formatVenueLocation('Carter-Finley Stadium', 'Raleigh'), 'Raleigh, NC')
  assert.equal(formatVenueLocation('BC Place', 'Vancouver'), 'Vancouver, BC, Canada')
  assert.equal(formatVenueLocation('Lincoln Financial Field', 'Philadelphia'), 'Philadelphia, PA')
})

test('a neutral-site arena abroad shows the city and country', () => {
  assert.equal(formatVenueLocation('Veikkaus Arena', 'Helsinki'), 'Helsinki, Finland')
})

test('the city fallback skips ambiguous names like Ontario', () => {
  assert.equal(formatVenueLocation('Some Stadium', 'Ontario'), 'Ontario')
})

