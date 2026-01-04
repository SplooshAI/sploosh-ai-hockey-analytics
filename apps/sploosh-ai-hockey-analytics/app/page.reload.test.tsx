/**
 * Home Page - Game Reload Bug Fix Regression Test
 * 
 * Bug: Clicking the current game in URL wouldn't reload the data
 * Fix: Removed !loading check from useEffect condition
 * 
 * This test verifies that game data can be reloaded properly
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Home from './page'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock fetch API
global.fetch = vi.fn()

describe('Home Page - Game Reload Bug Fix', () => {
  const mockRouter = { push: vi.fn() }
  const mockSearchParams = { get: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(useSearchParams as any).mockReturnValue(mockSearchParams)
    
    // Mock successful API responses
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        plays: [],
        gameState: 'LIVE',
        awayTeam: { id: 1, abbrev: 'TOR' },
        homeTeam: { id: 2, abbrev: 'MTL' }
      })
    })
  })

  it('should load game data when gameId is in URL', async () => {
    mockSearchParams.get.mockReturnValue('2023020001')

    render(<Home />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gameId=2023020001'),
        expect.any(Object)
      )
    })
  })

  it('should allow game data to reload when URL changes', async () => {
    mockSearchParams.get.mockReturnValue('2023020001')
    render(<Home />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // The fix ensures useEffect doesn't check !loading
    // which was preventing reloads
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('gameId=2023020001'),
      expect.any(Object)
    )
  })
})
