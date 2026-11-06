/**
 * Home Page - app share QR code
 *
 * With no game selected the main page shows a QR code for the app's base URL (no gameId).
 * Once a game is selected it is gone, because the game's own share cards take over.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Home from './page'
import { SITE } from '@/lib/constants'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))
vi.mock('@/components/layouts/main-layout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/features/shot-chart/shot-chart', () => ({
  ShotChart: () => <div data-testid="shot-chart" />,
}))
vi.mock('@/components/features/game-timeline/game-timeline', () => ({
  GameTimeline: () => <div data-testid="game-timeline" />,
}))

describe('Home Page - app share QR code', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: vi.fn() })
    global.fetch = vi.fn()
  })

  it('shows a QR code for the base URL, without gameId, when no game is selected', () => {
    ;(useSearchParams as any).mockReturnValue({ get: () => null })
    render(<Home />)

    const qr = screen.getByTestId('qr-app-share')
    expect(qr).toHaveAttribute('data-url', `${SITE.url}/`)
    expect(qr.getAttribute('data-url')).not.toContain('gameId')
    expect(screen.getByText('Scan or tap to open and share the app')).toBeInTheDocument()
  })

  it('does not show it once a game is selected', async () => {
    ;(useSearchParams as any).mockReturnValue({ get: () => '2026020141' })
    ;(global.fetch as any).mockImplementation(async () => ({ ok: true, json: async () => ({ id: 2026020141, gameDate: '2026-10-20', gameState: 'OFF', venue: { default: 'Test Arena' }, plays: [], awayTeam: { id: 1, abbrev: 'SJS', score: 4 }, homeTeam: { id: 2, abbrev: 'MTL', score: 3 } }) }))
    render(<Home />)

    await screen.findByRole('button', { name: /^share/i })
    expect(screen.queryByTestId('qr-app-share')).not.toBeInTheDocument()
  })
})
