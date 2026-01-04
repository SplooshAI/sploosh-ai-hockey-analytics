/**
 * Game Header - SOG Display Test
 * 
 * Verifies that SOG is displayed correctly:
 * - Shows "0 SOG" for live/completed games even when 0
 * - Does NOT show SOG for upcoming games (FUT, PRE states)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameHeader } from './game-header'

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null })
}))

describe('GameHeader - SOG Display', () => {
  const baseGameData = {
    id: 12345,
    season: 20252026,
    gameType: 2,
    gameDate: '2026-01-04',
    venue: { default: 'Test Arena' },
    awayTeam: {
      id: 1,
      abbrev: 'TOR',
      logo: 'https://example.com/tor.svg',
      score: 0,
      record: '20-10-5'
    },
    homeTeam: {
      id: 2,
      abbrev: 'MTL',
      logo: 'https://example.com/mtl.svg',
      score: 0,
      record: '18-12-5'
    },
    gameState: 'LIVE',
    periodDescriptor: { number: 1, periodType: 'REG' }
  }

  it('should display "0 SOG" for live games when shots on goal is 0', () => {
    const gameData = {
      ...baseGameData,
      gameState: 'LIVE',
      awayTeam: { ...baseGameData.awayTeam, sog: 0 },
      homeTeam: { ...baseGameData.homeTeam, sog: 0 }
    }

    render(<GameHeader gameData={gameData} />)
    
    // Should show "0 SOG" for both teams in live games
    const sogElements = screen.getAllByText('0 SOG')
    expect(sogElements).toHaveLength(2)
  })

  it('should display SOG for completed games', () => {
    const gameData = {
      ...baseGameData,
      gameState: 'FINAL',
      awayTeam: { ...baseGameData.awayTeam, sog: 15 },
      homeTeam: { ...baseGameData.homeTeam, sog: 12 }
    }

    render(<GameHeader gameData={gameData} />)
    
    // Should show SOG for both teams
    expect(screen.getByText('15 SOG')).toBeInTheDocument()
    expect(screen.getByText('12 SOG')).toBeInTheDocument()
  })

  it('should NOT display SOG for upcoming games', () => {
    const gameData = {
      ...baseGameData,
      gameState: 'FUT',
      awayTeam: { ...baseGameData.awayTeam, sog: undefined },
      homeTeam: { ...baseGameData.homeTeam, sog: undefined }
    }

    render(<GameHeader gameData={gameData} />)
    
    // Should NOT show any SOG text for upcoming games
    expect(screen.queryByText(/SOG/i)).toBeNull()
  })
})
