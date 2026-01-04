/**
 * Game Data Loading Tests
 * 
 * Tests for the main game page data loading functionality, including:
 * - Proper data fetching and state management
 * - Regression test for race condition bug (fixed by removing 'loading' from useEffect deps)
 * - Loading states and error handling
 */

import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { vi } from 'vitest'
import Home from '../app/page'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock fetch API
global.fetch = vi.fn()

const mockRouter = { push: vi.fn() }
const mockSearchParams = { get: vi.fn() }

describe('Game Data Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(useSearchParams as any).mockReturnValue(mockSearchParams)
    
    // Mock successful API responses
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('play-by-play')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 2025020386,
            gameState: 'OFF',
            gameDate: '2025-11-28',
            awayTeam: { abbrev: 'AWAY' },
            homeTeam: { abbrev: 'HOME' },
          }),
        })
      }
      if (url.includes('game-center')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 2025020386,
            tvBroadcasts: [],
          }),
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  describe('Data Loading', () => {
    it('should load game data correctly when gameId is provided', async () => {
      // Regression test: ensures data loads properly without race condition
      // (Original bug: 'loading' in useEffect deps caused stuck loading state)
      
      mockSearchParams.get.mockReturnValue('2025020386')
      
      let fetchCallCount = 0
      ;(global.fetch as any).mockImplementation((_url: string) => {
        fetchCallCount++
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 2025020386,
            gameState: 'OFF',
            gameDate: '2025-11-28',
            awayTeam: { abbrev: 'AWAY' },
            homeTeam: { abbrev: 'HOME' },
          }),
        })
      })
      
      render(<Home />)
      
      // Should show loading initially
      expect(screen.getByText('Loading play-by-play data...')).toBeInTheDocument()
      
      // With our fix, data should load and loading state should clear
      await waitFor(() => {
        expect(screen.queryByText('Loading play-by-play data...')).toBeNull()
      }, { timeout: 3000 })
      
      // Verify that fetch was called and data loaded successfully
      expect(fetchCallCount).toBeGreaterThan(0)
    })

    it('should handle network delays without getting stuck in loading state', async () => {
      // Regression test: verifies race condition fix with realistic network delay
      // Bug was: }, [searchParams, selectedGameId, loading]) caused race condition
      // Fix: }, [searchParams, selectedGameId]) - removed 'loading' dependency
      
      mockSearchParams.get.mockReturnValue('2025020386')
      
      let fetchCallCount = 0
      ;(global.fetch as any).mockImplementation((_url: string) => {
        fetchCallCount++
        
        // Simulate realistic network delay
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve({
                id: 2025020386,
                gameState: 'OFF',
                gameDate: '2025-11-28',
                awayTeam: { abbrev: 'AWAY' },
                homeTeam: { abbrev: 'HOME' },
              }),
            })
          }, 100)
        })
      })
      
      render(<Home />)
      
      // Should show loading initially
      expect(screen.getByText('Loading play-by-play data...')).toBeInTheDocument()
      
      // FIXED: With loading removed from useEffect dependencies,
      // data should load properly without getting stuck
      await waitFor(() => {
        expect(screen.queryByText('Loading play-by-play data...')).toBeNull()
      }, { timeout: 2000 })
      
      // Verify fetch was called and data loaded
      expect(fetchCallCount).toBeGreaterThan(0)
      
      // Verify game content is displayed
      await waitFor(() => {
        expect(screen.getByText('Raw Game Data (JSON)')).toBeInTheDocument()
      })
    })
  })
})
