// Run with: node --test scripts/social-gif/special-game.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { specialGameBadge } from './special-game.mjs'

test('a special event shows its name', () => {
  assert.equal(specialGameBadge({ specialEvent: { name: { default: '2026 NHL Global Series' } } }), '2026 NHL Global Series')
  assert.equal(specialGameBadge({ specialEvent: { name: { default: '2027 NHL Winter Classic' } }, neutralSite: true }), '2027 NHL Winter Classic')
})

test('a neutral-site game with no event name is called out as neutral site', () => {
  assert.equal(specialGameBadge({ neutralSite: true }), 'Neutral site')
})

test('an ordinary home game has no badge', () => {
  assert.equal(specialGameBadge({}), '')
  assert.equal(specialGameBadge({ neutralSite: false, specialEvent: null }), '')
  assert.equal(specialGameBadge(undefined), '')
})
