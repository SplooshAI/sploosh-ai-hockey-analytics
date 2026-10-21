/**
 * Home page - the game header learns a game is neutral-site from the scores feed.
 * The play-by-play has the special event name but not the neutralSite flag.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
vi.mock('@/components/features/shot-chart/shot-chart', () => ({ ShotChart: () => <div /> }))
vi.mock('@/components/features/game-timeline/game-timeline', () => ({ GameTimeline: () => <div /> }))

const game = {
  id: 2026010044,
  gameDate: '2026-09-24',
  gameState: 'OFF',
  venue: { default: 'First Horizon Coliseum' },
  venueLocation: { default: 'Greensboro' },
  awayTeam: { id: 18, abbrev: 'NSH', score: 2 },
  homeTeam: { id: 12, abbrev: 'CAR', score: 3 },
  plays: [],
}

const mockFeeds = (neutralSite: boolean | undefined) => {
  ;(global.fetch as any).mockImplementation(async (url: string) => {
    const u = String(url)
    if (u.includes('/api/nhl/scores')) {
      return { ok: true, json: async () => ({ games: [{ id: game.id, neutralSite }] }) }
    }
    return { ok: true, json: async () => (u.includes('play-by-play') ? game : { tvBroadcasts: [] }) }
  })
}

describe('Home page - neutral-site call-out', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({ push: vi.fn() })
    ;(useSearchParams as any).mockReturnValue({ get: () => String(game.id) })
    global.fetch = vi.fn()
  })

  it('shows the Neutral site badge when the scores feed flags the game', async () => {
    mockFeeds(true)
    render(<Home />)
    expect(await screen.findByTestId('special-game-badge')).toHaveTextContent('Neutral site')
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/nhl/scores?date=2026-09-24'), expect.anything())
  })

  it('shows no badge for an ordinary game', async () => {
    mockFeeds(false)
    render(<Home />)
    await screen.findAllByText(/First Horizon Coliseum/)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/nhl/scores'), expect.anything()))
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
  })

  it('still shows the game when the scores feed fails', async () => {
    ;(global.fetch as any).mockImplementation(async (url: string) => {
      if (String(url).includes('/api/nhl/scores')) throw new Error('network')
      return { ok: true, json: async () => (String(url).includes('play-by-play') ? game : { tvBroadcasts: [] }) }
    })
    render(<Home />)
    expect((await screen.findAllByText(/First Horizon Coliseum/)).length).toBeGreaterThan(0)
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
  })

  it('does not crash before the neutral-site lookup finishes, even when the game data has no id', async () => {
    const errors: unknown[] = []
    const onError = (e: ErrorEvent) => { errors.push(e.error); e.preventDefault() }
    window.addEventListener('error', onError)
    // scores feed never answers, so neutralSite stays null while the header renders
    ;(global.fetch as any).mockImplementation(async (url: string) => {
      if (String(url).includes('/api/nhl/scores')) return new Promise(() => {})
      const { id: _id, ...noId } = game
      return { ok: true, json: async () => (String(url).includes('play-by-play') ? noId : { tvBroadcasts: [] }) }
    })
    render(<Home />)
    expect((await screen.findAllByText(/First Horizon Coliseum/)).length).toBeGreaterThan(0)
    window.removeEventListener('error', onError)
    expect(errors).toEqual([])
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
  })
})

