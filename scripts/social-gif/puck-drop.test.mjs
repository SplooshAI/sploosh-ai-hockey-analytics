// Run with: node --test scripts/social-gif/puck-drop.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { formatPuckDrop } from './puck-drop.mjs'

test('Seattle: arena-local date and time with the zone abbreviation', () => {
  assert.equal(formatPuckDrop('2026-10-21T01:40:00Z', '-07:00', 'Seattle'), 'Tuesday, October 20th, 2026 @ 6:40 PM PDT')
})

test('Vancouver is on Pacific time, not Eastern', () => {
  assert.equal(formatPuckDrop('2026-10-21T02:00:00Z', '-07:00', 'Vancouver'), 'Tuesday, October 20th, 2026 @ 7:00 PM PDT')
})

test('an international arena uses its own zone', () => {
  assert.equal(formatPuckDrop('2026-11-12T17:00:00Z', '+02:00', 'Helsinki'), 'Thursday, November 12th, 2026 @ 7:00 PM EET')
})

test('ordinal suffixes: 1st, 2nd, 3rd, 11th, 22nd', () => {
  const day = (d) => formatPuckDrop(`2026-11-${String(d).padStart(2, '0')}T20:00:00Z`, '-05:00', 'Raleigh')
  assert.match(day(1), /November 1st,/)
  assert.match(day(2), /November 2nd,/)
  assert.match(day(3), /November 3rd,/)
  assert.match(day(11), /November 11th,/)
  assert.match(day(22), /November 22nd,/)
})

test('no start time means no text', () => {
  assert.equal(formatPuckDrop(undefined, '-07:00', 'Seattle'), '')
})
