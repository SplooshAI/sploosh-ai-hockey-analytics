/**
 * Version - GitHub repository link
 *
 * The version line links to the GitHub repository, with a GitHub icon as the visual cue.
 * lib/version.ts pointed at the old sploosh-ai-nhl-shot-chart repository name.
 */

import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { Version } from './version'
import { getVersionInfo } from '../../../lib/version'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

const REPO_URL = 'https://github.com/SplooshAI/sploosh-ai-hockey-analytics'

describe('Version', () => {
  it('points the repository URL at the hockey analytics repository', () => {
    expect(getVersionInfo().repoUrl).toBe(REPO_URL)
  })

  it('links the version to the GitHub repository in a new tab', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    expect(link).toHaveAttribute('href', REPO_URL)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(link).toHaveTextContent(`Sploosh.AI Hockey Analytics v${getVersionInfo().version}`)
  })

  it('shows a GitHub icon inside the link', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    expect(link.querySelector('svg')).not.toBeNull()
  })
})
