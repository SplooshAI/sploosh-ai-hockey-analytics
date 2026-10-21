/**
 * Game header - special and neutral-site games are called out, and the arena shows its city and region.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameHeader } from './game-header'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null })
}))

const base = {
  id: 2026020309,
  gameDate: '2026-11-12',
  gameState: 'FUT',
  startTimeUTC: '2026-11-12T17:00:00Z',
  awayTeam: { abbrev: 'CAR' },
  homeTeam: { abbrev: 'SEA' },
}

const globalSeries = {
  ...base,
  venue: { default: 'Veikkaus Arena' },
  venueLocation: { default: 'Helsinki' },
  specialEvent: {
    name: { default: '2026 NHL Global Series' },
    lightLogoUrl: { default: 'https://assets.nhle.com/gs-banner.svg' },
  },
}

describe('GameHeader - special games', () => {
  it('calls out a special event by its name', () => {
    render(<GameHeader gameData={globalSeries} />)
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('2026 NHL Global Series')
  })

  it('calls out a neutral-site game that has no event name', () => {
    render(<GameHeader gameData={{ ...base, venue: { default: 'First Horizon Coliseum' }, venueLocation: { default: 'Greensboro' }, neutralSite: true }} />)
    expect(screen.getByTestId('special-game-badge')).toHaveTextContent('Neutral site')
  })

  it('has no call-out for an ordinary game', () => {
    render(<GameHeader gameData={{ ...base, venue: { default: 'Climate Pledge Arena' }, venueLocation: { default: 'Seattle' } }} />)
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
  })

  it('shows the arena with its city and region outside the US', () => {
    render(<GameHeader gameData={globalSeries} />)
    expect(screen.getByText('Veikkaus Arena · Helsinki, Finland')).toBeInTheDocument()
  })

  it('shows the arena with its city and state in the US', () => {
    render(<GameHeader gameData={{ ...base, venue: { default: 'Climate Pledge Arena' }, venueLocation: { default: 'Seattle' } }} />)
    expect(screen.getByText('Climate Pledge Arena · Seattle, WA')).toBeInTheDocument()
  })

  it('shows just the arena when the feed has no city', () => {
    render(<GameHeader gameData={{ ...base, venue: { default: 'Test Arena' } }} />)
    expect(screen.getByText('Test Arena')).toBeInTheDocument()
  })

  it('shows a generated banner instead of the name badge when the feed has no artwork', () => {
    render(
      <GameHeader
        gameData={{
          ...base,
          venue: { default: 'AT&T Stadium' },
          venueLocation: { default: 'Arlington' },
          specialEvent: { name: { default: '2027 Navy Federal Credit Union NHL Stadium Series' } },
        } as any}
      />
    )
    expect(screen.getByTestId('special-event-banner')).toHaveTextContent('Stadium Series')
    expect(screen.queryByTestId('special-game-badge')).not.toBeInTheDocument()
  })

  it('tints the name badge with the event colors when the feed has artwork', () => {
    render(<GameHeader gameData={globalSeries} />)
    expect(screen.getByTestId('special-game-badge')).toHaveStyle({ backgroundColor: '#0b3a8f' })
    expect(screen.queryByTestId('special-event-banner')).not.toBeInTheDocument()
  })
})
