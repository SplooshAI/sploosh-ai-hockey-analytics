/**
 * Game timeline for a game decided in a shootout: the Goals count matches the
 * official score. Shootout attempts are not listed; only the winning goal is.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameTimeline } from './game-timeline'
import { shootoutGame } from '@/lib/utils/shootout.fixture'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

describe('GameTimeline - shootout game', () => {
  it('counts 6 regulation goals plus the 1 winning shootout goal, not every shootout goal', () => {
    render(<GameTimeline gameData={shootoutGame} />)
    expect(screen.getByRole('button', { name: /^Goals \(7\)$/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Goals \(9\)$/ })).not.toBeInTheDocument()
  })

  it('counts only the regulation shot-on-goal events, not shootout shots', () => {
    render(<GameTimeline gameData={shootoutGame} />)
    expect(screen.getByRole('button', { name: /^Shots on Goal \(1\)$/ })).toBeInTheDocument()
  })
})
