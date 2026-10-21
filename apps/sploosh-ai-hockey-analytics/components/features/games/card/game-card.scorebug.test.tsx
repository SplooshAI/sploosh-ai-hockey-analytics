/**
 * Sidebar game card - compact scorebug
 *
 * Verifies the card uses the compact scorebug (no Sploosh.AI branding), keeps the special-event
 * logo, badge and arena line, and rings special and neutral-site games in amber.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameCard } from './game-card'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null })
}))

const team = (abbrev: string, id: number, score = 0) => ({ id, abbrev, commonName: { default: abbrev }, score, sog: 20, record: '1-0-0', logo: `https://example.com/${abbrev}.svg` })

const game: any = {
  id: 2026020149,
  gameDate: '2026-10-20',
  gameState: 'FINAL',
  gameType: 2,
  gameCenterLink: '/gamecenter/2026020149',
  gameScheduleState: 'OK',
  season: 20262027,
  startTimeUTC: '2026-10-21T02:00:00Z',
  periodDescriptor: { number: 5, periodType: 'SO' },
  awayTeam: team('DET', 17, 3),
  homeTeam: team('SEA', 55, 4),
  venue: { default: 'Climate Pledge Arena' },
  venueLocation: { default: 'Seattle' },
}

describe('GameCard - compact scorebug', () => {
  it('renders the compact scorebug with scores, abbreviations, and status', () => {
    render(<GameCard game={game} />)
    const bug = screen.getByTestId('scorebug')
    expect(bug).toHaveAttribute('data-variant', 'card')
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('DET')).toBeInTheDocument()
    expect(screen.getByText('SEA')).toBeInTheDocument()
    expect(screen.getByText('Final (SO)')).toBeInTheDocument()
  })

  it('has no Sploosh.AI branding on a card', () => {
    render(<GameCard game={game} />)
    expect(screen.queryByTestId('scorebug-badge')).not.toBeInTheDocument()
    expect(screen.queryByText(/Sploosh\.AI/i)).not.toBeInTheDocument()
  })

  it('has no amber ring on an ordinary game', () => {
    render(<GameCard game={game} />)
    expect(screen.getByTestId('scorebug').className).not.toContain('ring-amber-500')
  })

  it('rings a neutral-site game in amber and keeps its badge and arena line', () => {
    render(<GameCard game={{ ...game, neutralSite: true, venue: { default: 'First Horizon Coliseum' }, venueLocation: { default: 'Greensboro' } }} />)
    expect(screen.getByTestId('scorebug').className).toContain('ring-amber-500')
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('Neutral site')
    expect(screen.getByText(/First Horizon Coliseum/)).toBeInTheDocument()
  })

  it('keeps the special-event logo banner, badge, and ring for a special event', () => {
    render(
      <GameCard
        game={{
          ...game,
          neutralSite: true,
          venue: { default: 'Veikkaus Arena' },
          venueLocation: { default: 'Helsinki' },
          specialEvent: { parentId: 36, name: { default: '2026 NHL Global Series' }, lightLogoUrl: { default: 'https://example.com/event.svg' } },
        }}
      />
    )
    expect(screen.getByAltText('2026 NHL Global Series')).toBeInTheDocument()
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('2026 NHL Global Series')
    expect(screen.getByTestId('scorebug').className).toContain('ring-amber-500')
  })

  it('hides SOG before a game starts and shows the start time on the plate', () => {
    render(<GameCard game={{ ...game, gameState: 'FUT', periodDescriptor: undefined, awayTeam: team('DET', 17), homeTeam: team('SEA', 55) }} />)
    expect(screen.queryByText(/SOG/)).not.toBeInTheDocument()
    expect(screen.getByText(/\d{1,2}:\d{2} [AP]M/)).toBeInTheDocument()
  })

  it('shows a pulsing dot for a live game', () => {
    const { container } = render(
      <GameCard game={{ ...game, gameState: 'LIVE', clock: { timeRemaining: '07:12', inIntermission: false }, periodDescriptor: { number: 2, periodType: 'REG' } }} />
    )
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
    expect(screen.getByText('2nd Period - 07:12')).toBeInTheDocument()
  })
})
