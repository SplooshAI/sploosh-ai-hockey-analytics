/**
 * Home Page - QR code placement
 *
 * With a shot chart the QR codes sit underneath it (not in the header footer);
 * without one they stay in the header footer. The Share link is always in the footer.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Home from './page'

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

const baseGame = {
  id: 2026020141,
  gameDate: '2026-10-20',
  gameState: 'OFF',
  venue: { default: 'Test Arena' },
  awayTeam: { id: 1, abbrev: 'SJS', score: 4 },
  homeTeam: { id: 2, abbrev: 'MTL', score: 3 },
}
const shot = { typeDescKey: 'shot-on-goal', details: { xCoord: 10, yCoord: 5 } }

const mockGame = (plays: unknown[]) => {
  ;(global.fetch as any).mockImplementation(async (url: string) => ({
    ok: true,
    json: async () => (String(url).includes('play-by-play') ? { ...baseGame, plays } : { tvBroadcasts: [] }),
  }))
}

describe('Home Page - QR code placement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: vi.fn() })
    ;(useSearchParams as any).mockReturnValue({ get: () => '2026020141' })
    global.fetch = vi.fn()
  })

  it('places the QR codes underneath the shot chart, not in the header footer', async () => {
    mockGame([shot])
    render(<Home />)

    const chart = await screen.findByTestId('shot-chart')
    const chartCard = chart.parentElement as HTMLElement
    expect(within(chartCard).getByTestId('qr-game-center')).toBeInTheDocument()
    expect(within(chartCard).getByTestId('qr-share')).toBeInTheDocument()
    // QR codes come after the chart within its card
    const qr = within(chartCard).getByTestId('qr-share')
    expect(chart.compareDocumentPosition(qr) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // each code is labelled with its own name
    expect(within(qr.closest('figure') as HTMLElement).getByText('Sploosh.AI Hockey Analytics')).toBeInTheDocument()
    expect(
      within(within(chartCard).getByTestId('qr-game-center').closest('figure') as HTMLElement).getByText(/NHL® Game Center/)
    ).toBeInTheDocument()
    expect(within(chartCard).getByRole('separator')).toBeInTheDocument()
    // exactly one of each on the page, and the Share link stays in the footer
    expect(screen.getAllByTestId('qr-share')).toHaveLength(1)
    expect(screen.getAllByTestId('qr-game-center')).toHaveLength(1)
    expect(screen.getByRole('button', { name: /^share/i })).toBeInTheDocument()
  })

  it('keeps the QR codes in the header footer when there is no shot chart', async () => {
    mockGame([])
    render(<Home />)

    const share = await screen.findByRole('button', { name: /^share/i })
    await waitFor(() => expect(screen.getByTestId('qr-share')).toBeInTheDocument())
    expect(screen.queryByTestId('shot-chart')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('qr-share')).toHaveLength(1)
    expect(screen.getAllByTestId('qr-game-center')).toHaveLength(1)
    // footer column holds both the Share link and its QR code
    expect(share.parentElement).toContainElement(screen.getByTestId('qr-share'))
  })
})
