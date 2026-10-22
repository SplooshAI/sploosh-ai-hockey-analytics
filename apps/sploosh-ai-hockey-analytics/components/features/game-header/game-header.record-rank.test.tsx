/**
 * Game Header - record and standings rank
 *
 * The header shows each team's record and, when the standings are known, its division and conference rank.
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

const game = (away: object, home: object, extra: object = {}) => ({
  id: 1,
  gameDate: '2026-10-22',
  gameState: 'FUT',
  startTimeUTC: '2026-10-23T02:00:00Z',
  venue: { default: 'Climate Pledge Arena' },
  awayTeam: { abbrev: 'UTA', ...away },
  homeTeam: { abbrev: 'SEA', ...home },
  ...extra,
})

describe('GameHeader - record and rank', () => {
  it('shows record and rank for both teams', () => {
    render(<GameHeader gameData={game({ record: '7-3-0', rank: '1st in Central, 3rd in West' }, { record: '6-3-1', rank: '3rd in Pacific, 5th in West' })} />)
    expect(screen.getByText('7-3-0')).toBeInTheDocument()
    expect(screen.getByText('6-3-1')).toBeInTheDocument()
    expect(screen.getByText('3rd in Pacific, 5th in West')).toBeInTheDocument()
    expect(screen.getAllByTestId('team-rank')).toHaveLength(2)
  })

  it('falls back to the record only when rank data is missing', () => {
    render(<GameHeader gameData={game({ record: '7-3-0' }, { record: '6-3-1' })} />)
    expect(screen.getByText('7-3-0')).toBeInTheDocument()
    expect(screen.queryByTestId('team-rank')).not.toBeInTheDocument()
  })

  it('still renders ranks on neutral-site games', () => {
    render(<GameHeader gameData={game({ record: '7-3-0', rank: '1st in Central, 3rd in West' }, { record: '6-3-1', rank: '3rd in Pacific, 5th in West' }, { neutralSite: true })} />)
    expect(screen.getAllByTestId('team-rank')).toHaveLength(2)
  })
})
