/**
 * Version - GitHub repository link
 *
 * The sidebar version block is one card: a GitHub link header (icon, app name, external-link
 * arrow), then the version badge, release date, and copyright.
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

  it('shows the app name in the link and the version badge in the same card', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    const badge = screen.getByText(`v${getVersionInfo().version}`)
    expect(link).toHaveTextContent('Sploosh.AI')
    expect(link).toHaveTextContent('Hockey Analytics')
    expect(badge).toBeInTheDocument()
    expect(badge.closest('[data-testid="version-card"]')).toBe(link.closest('[data-testid="version-card"]'))
    expect(link.closest('[data-testid="version-card"]')).not.toBeNull()
  })

  it('keeps the copyright inside the card, below the link', () => {
    render(<Version />)

    const card = screen.getByTestId('version-card')
    const copyright = screen.getByText(`© ${new Date().getFullYear()} Sploosh.AI. All rights reserved.`)
    expect(card).toContainElement(copyright)
    expect(screen.getByRole('link', { name: /view the repository on github/i })).not.toContainElement(copyright)
  })

  it('shows the GitHub icon and an external-link arrow in the link', () => {
    render(<Version />)

    const link = screen.getByRole('link', { name: /view the repository on github/i })
    expect(link.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2)
  })
})
