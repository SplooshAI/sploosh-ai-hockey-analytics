/**
 * Sidebar game card - special and neutral-site games are called out with their arena, city and region.
 * Ordinary games stay compact.
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

const team = (abbrev: string, id: number) => ({ id, abbrev, commonName: { default: abbrev }, score: 0, logo: `https://example.com/${abbrev}.svg` })

const game: any = {
  id: 2026020309,
  gameDate: '2026-11-12',
  gameState: 'FUT',
  gameType: 2,
  gameCenterLink: '/gamecenter/2026020309',
  gameScheduleState: 'OK',
  season: 20262027,
  startTimeUTC: '2026-11-12T17:00:00Z',
  awayTeam: team('CAR', 12),
  homeTeam: team('SEA', 55),
}

describe('GameCard - special games', () => {
  it('shows the event name badge, arena, city and region for a special event', () => {
    render(
      <GameCard
        game={{
          ...game,
          venue: { default: 'Veikkaus Arena' },
          venueLocation: { default: 'Helsinki' },
          neutralSite: true,
          specialEvent: { parentId: 36, name: { default: '2026 NHL Global Series' }, lightLogoUrl: { default: 'https://example.com/logo.svg' } },
        }}
      />
    )
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('2026 NHL Global Series')
    expect(screen.getByText('Veikkaus Arena · Helsinki, Finland')).toBeInTheDocument()
  })

  it('calls out a neutral-site game with no event name', () => {
    render(<GameCard game={{ ...game, venue: { default: 'First Horizon Coliseum' }, venueLocation: { default: 'Greensboro' }, neutralSite: true }} />)
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('Neutral site')
    expect(screen.getByText(/First Horizon Coliseum/)).toBeInTheDocument()
  })

  it('shows the arena without a city when the feed has none', () => {
    render(<GameCard game={{ ...game, venue: { default: 'Veikkaus Arena' }, neutralSite: true }} />)
    expect(screen.getByText('Veikkaus Arena')).toBeInTheDocument()
  })

  it('keeps an ordinary game compact: no badge and no arena line', () => {
    render(<GameCard game={{ ...game, venue: { default: 'Climate Pledge Arena' }, venueLocation: { default: 'Seattle' } }} />)
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
    expect(screen.queryByText(/Climate Pledge Arena/)).not.toBeInTheDocument()
  })
})
