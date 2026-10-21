/**
 * Version - GitHub repository link
 *
 * The version block is a card-style link to the GitHub repository: GitHub icon, app name,
 * version badge, and a "View on GitHub" cue with an external-link arrow.
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
  })

  it('shows the app name, the version as a badge, and a view-on-GitHub cue', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    expect(link).toHaveTextContent('Sploosh.AI Hockey Analytics')
    expect(screen.getByText(`v${getVersionInfo().version}`)).toBeInTheDocument()
    expect(screen.getByText('View on GitHub')).toBeInTheDocument()
    expect(link).toContainElement(screen.getByText(`v${getVersionInfo().version}`))
    expect(link).toContainElement(screen.getByText('View on GitHub'))
  })

  it('shows the GitHub icon and an external-link arrow inside the link', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    expect(link.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2)
  })
})
