/**
 * Game Timeline - Goalie Pulled Regression Test
 * 
 * Bug: Goalie pulled situations were incorrectly showing as PPG/SHG
 * Fix: Check goalie status (positions 0 and 3 in situation code) before displaying badges
 * 
 * This test verifies that goals scored when ANY goalie is pulled display ENG badges instead of PPG/SHG
 * This includes:
 * - Empty net goals (opposing goalie pulled) - Shows "ENG" with cyan badge (icing on the cake)
 * - Goals scored with +1 skater - Shows "ENG (TEAM +1 skater)" with green badge (successful risky play)
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameTimeline } from './game-timeline'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

describe('GameTimeline - Goalie Pulled', () => {
  const baseGameData = {
    awayTeam: { id: 1, abbrev: 'TOR', name: { default: 'Toronto Maple Leafs' } },
    homeTeam: { id: 2, abbrev: 'MTL', name: { default: 'Montreal Canadiens' } },
    rosterSpots: []
  }

  it('should show cyan ENG badge for empty net goal (opposing goalie pulled)', () => {
    const gameData = {
      ...baseGameData,
      plays: [{
        eventId: 1,
        typeDescKey: 'goal',
        periodDescriptor: { number: 3 },
        timeInPeriod: '19:30',
        timeRemaining: '00:30',
        situationCode: '1560', // Away goalie in (1), 5v6, home goalie pulled (0)
        details: {
          eventOwnerTeamId: 1,
          scoringPlayerId: 100,
          awayScore: 3,
          homeScore: 2
        }
      }]
    }

    const { container } = render(<GameTimeline gameData={gameData} />)
    
    // Should show ENG badge for empty net goal with cyan background
    expect(screen.getByText('ENG')).toBeInTheDocument()
    const badge = container.querySelector('.bg-cyan-600')
    expect(badge).toBeInTheDocument()
    // Should NOT show PPG badge
    expect(screen.queryByText('PPG')).toBeNull()
  })

  it('should show green ENG badge when own goalie is pulled (extra attacker)', () => {
    const gameData = {
      ...baseGameData,
      plays: [{
        eventId: 1,
        typeDescKey: 'goal',
        periodDescriptor: { number: 3 },
        timeInPeriod: '18:17',
        timeRemaining: '01:43',
        situationCode: '0641', // Away goalie pulled (0), 6v4, home goalie in (1)
        details: {
          eventOwnerTeamId: 1, // Away team scores with own goalie pulled
          scoringPlayerId: 100,
          awayScore: 3,
          homeScore: 3
        }
      }]
    }

    const { container } = render(<GameTimeline gameData={gameData} />)
    
    // Should show ENG badge with team abbreviation and green background for goal with +1 skater
    expect(screen.getByText(/ENG/)).toBeInTheDocument()
    expect(screen.getByText(/TOR \+1 skater/)).toBeInTheDocument()
    const badge = container.querySelector('.bg-green-600')
    expect(badge).toBeInTheDocument()
    // Should NOT show PPG badge even though 6v4
    expect(screen.queryByText('PPG')).toBeNull()
  })

  it('should show PPG badge for legitimate power play goal (both goalies in)', () => {
    const gameData = {
      ...baseGameData,
      plays: [{
        eventId: 1,
        typeDescKey: 'goal',
        periodDescriptor: { number: 2 },
        timeInPeriod: '10:00',
        timeRemaining: '10:00',
        situationCode: '1541', // Both goalies in (1,1), 5v4 power play
        details: {
          eventOwnerTeamId: 1,
          scoringPlayerId: 100,
          awayScore: 2,
          homeScore: 1
        }
      }]
    }

    render(<GameTimeline gameData={gameData} />)
    
    // Legitimate power play should show PPG badge
    expect(screen.getByText('PPG')).toBeInTheDocument()
  })
})
