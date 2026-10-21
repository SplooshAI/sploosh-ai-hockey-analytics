/**
 * deploy-to-oracle.sh - settings file sync
 *
 * The GitHub Actions deploy has no TUNNEL_TOKEN, so it must not overwrite the VM's
 * .env.deploy (which holds the token the cloudflared container reads). A settings
 * file that includes the token is still copied, as for a deploy from a laptop.
 * ssh, scp and rsync are stubbed; the stubs record each call.
 */

import { spawnSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'

const script = path.resolve(__dirname, '../../../scripts/deploy/deploy-to-oracle.sh')

let dir: string

function runSync(settings: string) {
  writeFileSync(path.join(dir, 'settings.env'), settings)
  const result = spawnSync('bash', [script, 'sync'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${path.join(dir, 'bin')}:${process.env.PATH}`,
      HOME: dir,
      DEPLOY_ENV_FILE: path.join(dir, 'settings.env'),
    },
  })
  const calls = readFileSync(path.join(dir, 'calls.log'), 'utf8').split('\n').filter(Boolean)
  return { status: result.status, output: result.stdout + result.stderr, calls }
}

describe('deploy-to-oracle.sh sync', () => {
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'deploy-test-'))
    mkdirSync(path.join(dir, 'bin'))
    mkdirSync(path.join(dir, '.ssh'))
    writeFileSync(path.join(dir, '.ssh', 'hockey_oracle_deploy'), 'not a real key')
    writeFileSync(path.join(dir, 'calls.log'), '')
    for (const tool of ['ssh', 'scp', 'rsync']) {
      const stub = path.join(dir, 'bin', tool)
      writeFileSync(stub, `#!/usr/bin/env bash\necho "${tool} $*" >> "${dir}/calls.log"\n`)
      chmodSync(stub, 0o755)
    }
  })

  it('copies the settings file to the VM when it has a TUNNEL_TOKEN', () => {
    const { status, calls } = runSync('HOCKEY_VM_IP=203.0.113.7\nTUNNEL_TOKEN=abc\n')

    expect(status).toBe(0)
    expect(calls.some(c => c.startsWith('scp ') && c.includes('203.0.113.7:'))).toBe(true)
  })

  it('leaves the VM settings file alone when there is no TUNNEL_TOKEN', () => {
    const { status, calls, output } = runSync('HOCKEY_VM_IP=203.0.113.7\n')

    expect(status).toBe(0)
    expect(calls.some(c => c.startsWith('scp '))).toBe(false)
    expect(calls.some(c => c.startsWith('rsync '))).toBe(true)
    expect(output).toContain('keeping the settings file already on the VM')
  })
})
