/**
 * PR title classifier - regression test
 *
 * Bug: "fix(sidebar): ..." failed both the Semantic PR Check and the Main Branch Merge
 * version bump, because the workflow regexes only accepted "type:" with no scope.
 * Fix: both workflows call scripts/ci/classify-pr-title.sh, which accepts an optional
 * (scope) and "!" and prints the bump type.
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

const script = path.resolve(__dirname, '../../../scripts/ci/classify-pr-title.sh')

function classify(title: string) {
  const result = spawnSync('bash', [script, title], { encoding: 'utf8' })
  return { status: result.status, bump: result.stdout.trim() }
}

describe('classify-pr-title.sh', () => {
  it.each([
    ['fix: header returns to the root view', 'patch'],
    ['fix(sidebar): NHL Games header resets the date', 'patch'],
    ['docs(readme): update deploy steps', 'patch'],
    ['chore: bump version from 2.16.0 to 2.16.1', 'patch'],
    ['feat: add a shot chart filter', 'minor'],
    ['feat(shot-chart): add a filter', 'minor'],
    ['feat!: drop the legacy API', 'major'],
    ['feat(api)!: drop the legacy API', 'major'],
    ['fix!: change the response shape', 'major'],
    ['fix(api)!: change the response shape', 'major'],
  ])('accepts %s as %s', (title, bump) => {
    expect(classify(title)).toEqual({ status: 0, bump })
  })

  it.each([
    'adding some feature without proper format',
    'Fix: capitalised type',
    'fix(): empty scope',
    'fix(sidebar) missing colon',
    'feature: unknown type',
    '',
  ])('rejects %j', title => {
    expect(classify(title)).toEqual({ status: 1, bump: '' })
  })
})
