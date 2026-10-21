/**
 * Scorebug - Split look
 *
 * Verifies the broadcast-style header panel:
 * - Scores, abbreviations, and the status plate render for final, live, and upcoming games
 * - The losing score is dimmed on a final game, never on a live or tied one
 * - The Sploosh.AI Hockey Analytics ribbon and the arena line are present
 * - SOG is hidden before a game starts, and a missing logo falls back to the abbreviation
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Scorebug, scorebugColors } from './scorebug'
import { GameHeader } from './game-header'

vi.mock('next/image', () => ({
  default: ({ src, alt, onError }: { src: string; alt: string; onError?: () => void }) => (
    <img src={src} alt={alt} onError={onError} />
  ),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

const away = { abbrev: 'DET', logo: 'https://example.com/det.svg', score: 3, sog: 24, record: '2-3-1' }
const home = { abbrev: 'SEA', logo: 'https://example.com/sea.svg', score: 4, sog: 27, record: '3-2-1' }

const renderBug = (props: Partial<React.ComponentProps<typeof Scorebug>> = {}) =>
  render(
    <Scorebug
      variant="split"
      awayTeam={away}
      homeTeam={home}
      status="Final (SO)"
      statusClass="text-muted-foreground"
      showSog
      venue="Climate Pledge Arena · Seattle, WA"
      {...props}
    />
  )

describe('Scorebug', () => {
  it('shows both scores, both abbreviations, and the status plate', () => {
    renderBug()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getAllByText('DET').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SEA').length).toBeGreaterThan(0)
    expect(screen.getByText('Final (SO)')).toBeInTheDocument()
  })

  it('shows SOG and record for each team on a started game', () => {
    renderBug()
    expect(screen.getByText('24 SOG')).toBeInTheDocument()
    expect(screen.getByText('27 SOG')).toBeInTheDocument()
    expect(screen.getByText('2-3-1')).toBeInTheDocument()
    expect(screen.getByText('3-2-1')).toBeInTheDocument()
  })

  it('hides SOG before the game starts but keeps records', () => {
    renderBug({ showSog: false, status: '7:30 PM EDT' })
    expect(screen.queryByText(/SOG/)).not.toBeInTheDocument()
    expect(screen.getByText('2-3-1')).toBeInTheDocument()
  })

  it('shows the Sploosh.AI Hockey Analytics ribbon', () => {
    renderBug()
    expect(screen.getByTestId('scorebug-badge')).toHaveTextContent('Sploosh.AI Hockey Analytics')
  })

  it('shows the arena line along the bottom', () => {
    renderBug()
    expect(screen.getByTestId('scorebug-venue')).toHaveTextContent('Climate Pledge Arena · Seattle, WA')
  })

  it('keeps the arena line and the ribbon on one line at any width', () => {
    renderBug()
    expect(screen.getByTestId('scorebug-venue').className).toContain('whitespace-nowrap')
    expect(screen.getByTestId('scorebug-badge').querySelector('span')?.className).toContain('whitespace-nowrap')
  })

  it('centers each score on its team logo row', () => {
    renderBug()
    const score = screen.getByText('3')
    expect(score.className).toContain('flex')
    expect(score.className).toContain('items-center')
    expect(score.className).toContain('h-10')
    expect(score.className).toContain('sm:h-16')
    expect(score.parentElement?.className).toContain('items-start')
  })

  it('omits the arena line when no venue is given', () => {
    renderBug({ venue: undefined })
    expect(screen.queryByTestId('scorebug-venue')).not.toBeInTheDocument()
  })

  it('dims the losing score on a final game', () => {
    renderBug()
    expect(screen.getByText('3').className).toContain('opacity-55')
    expect(screen.getByText('4').className).not.toContain('opacity-55')
  })

  it('does not dim either score on a live game', () => {
    renderBug({ status: '2nd Period - 07:12', statusClass: 'text-green-500' })
    expect(screen.getByText('3').className).not.toContain('opacity-55')
    expect(screen.getByText('4').className).not.toContain('opacity-55')
  })

  it('shows a pulsing dot on a live game only', () => {
    const { container, rerender } = renderBug({ status: '2nd Period - 07:12', statusClass: 'text-green-500' })
    expect(container.querySelector('.animate-pulse')).not.toBeNull()
    rerender(
      <Scorebug variant="split" awayTeam={away} homeTeam={home} status="Final (SO)" statusClass="text-muted-foreground" showSog />
    )
    expect(container.querySelector('.animate-pulse')).toBeNull()
  })

  it('falls back to the abbreviation when a logo fails to load', () => {
    renderBug()
    const before = screen.getAllByText('DET').length
    fireEvent.error(screen.getByAltText('DET'))
    expect(screen.queryByAltText('DET')).not.toBeInTheDocument()
    expect(screen.getAllByText('DET')).toHaveLength(before + 1)
  })

  it('keeps the status on one line and under the scores on narrow screens', () => {
    renderBug({ status: '2nd Period - 07:12', statusClass: 'text-green-500' })
    const plate = screen.getByText('2nd Period - 07:12')
    expect(plate.className).toContain('whitespace-nowrap')
    expect(plate.className).toContain('col-span-2')
    expect(plate.className).toContain('row-start-2')
    expect(plate.className).toContain('sm:col-start-2')
  })

  it('stacks SOG above the record on narrow screens', () => {
    renderBug()
    const sog = screen.getByText('24 SOG')
    expect(sog.parentElement?.className).toContain('flex-col')
    expect(sog.parentElement?.className).toContain('sm:flex-row')
    expect(sog.parentElement?.className).toContain('whitespace-nowrap')
  })

  it('tints the panel with the teams colors', () => {
    renderBug()
    const bug = screen.getByTestId('scorebug')
    expect(bug.getAttribute('style')).toContain('#CE1126') // DET red
    expect(bug.getAttribute('style')).toContain('#68A2B9') // SEA blue
  })
})

describe('GameHeader uses the Split scorebug', () => {
  it('renders the split scorebug with the arena line and no duplicate venue text', () => {
    render(
      <GameHeader
        gameData={{
          id: 2026020149,
          gameDate: '2026-10-20',
          gameState: 'FINAL',
          awayTeam: away,
          homeTeam: home,
          venue: { default: 'Climate Pledge Arena' },
          venueLocation: { default: 'Seattle, WA' },
          periodDescriptor: { number: 5, periodType: 'SO' },
        }}
      />
    )
    expect(screen.getByTestId('scorebug')).toHaveAttribute('data-variant', 'split')
    expect(screen.getAllByText(/Climate Pledge Arena/)).toHaveLength(1)
    expect(screen.getByText('Final (SO)')).toBeInTheDocument()
  })
})

describe('scorebugColors', () => {
  it('uses both primary colors when they are easy to tell apart', () => {
    expect(scorebugColors('DET', 'SEA')).toEqual({ away: '#CE1126', home: '#68A2B9' })
  })

  it('switches the home side to its secondary color when both teams are red', () => {
    const { away, home } = scorebugColors('FLA', 'OTT')
    expect(away).toBe('#C8102E')
    expect(home).toBe('#1c1c1c')
  })

  it('never leaves the two sides close in color', () => {
    const teams = ['DET', 'FLA', 'OTT', 'CAR', 'NJD', 'WSH', 'MTL', 'CGY', 'TOR', 'NYR', 'BUF', 'EDM', 'PHI']
    for (const a of teams) {
      for (const h of teams) {
        if (a === h) continue
        const { away, home } = scorebugColors(a, h)
        const d = (x: string, y: string) => {
          const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16))
          const [r1, g1, b1] = p(x)
          const [r2, g2, b2] = p(y)
          return Math.hypot(r1 - r2, g1 - g2, b1 - b2)
        }
        expect(d(away, home), `${a} vs ${h}`).toBeGreaterThanOrEqual(110)
      }
    }
  })

  it('falls back to a neutral color for an unknown team', () => {
    expect(scorebugColors('XXX', 'SEA').away).toBe('#475569')
  })
})
