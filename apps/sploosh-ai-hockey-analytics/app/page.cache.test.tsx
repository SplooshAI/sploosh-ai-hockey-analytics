/**
 * Cache and Offline UX Tests
 * 
 * Tests for the caching functionality and offline user experience:
 * - localStorage caching of game data
 * - Fallback to cached data when network fails
 * - Offline mode banner display
 * - Cache indicator visibility
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

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const mockRouter = { push: vi.fn() }
const mockSearchParams = { get: vi.fn() }

const mockGameData = {
  playByPlay: {
    id: 2025020386,
    gameState: 'FINAL',
    gameDate: '2025-11-28',
    awayTeam: { abbrev: 'COL', score: 1 },
    homeTeam: { abbrev: 'FLA', score: 2 },
  },
  gameCenter: {
    id: 2025020386,
    tvBroadcasts: [],
  },
}

describe('Cache and Offline UX', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    ;(useRouter as any).mockReturnValue(mockRouter)
    ;(useSearchParams as any).mockReturnValue(mockSearchParams)
  })

  describe('Cache Storage', () => {
    it('should cache game data after successful fetch', async () => {
      mockSearchParams.get.mockReturnValue('2025020386')
      
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('play-by-play')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGameData.playByPlay),
          })
        }
        if (url.includes('game-center')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGameData.gameCenter),
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      render(<Home />)
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText('Loading play-by-play data...')).toBeNull()
      }, { timeout: 3000 })
      
      // Verify cache was set
      const cacheKey = 'sploosh_cache_game_2025020386'
      const cached = localStorageMock.getItem(cacheKey)
      expect(cached).not.toBeNull()
      
      if (cached) {
        const parsedCache = JSON.parse(cached)
        expect(parsedCache.data).toBeDefined()
        expect(parsedCache.timestamp).toBeDefined()
        expect(parsedCache.expiresAt).toBeDefined()
      }
    })
  })

  describe('Offline Fallback', () => {
    it('should load cached data when network fails', async () => {
      // Pre-populate cache
      const cacheKey = 'sploosh_cache_game_2025020386'
      const cacheEntry = {
        data: {
          playByPlayData: mockGameData.playByPlay,
          gameCenterData: mockGameData.gameCenter,
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour
      }
      localStorageMock.setItem(cacheKey, JSON.stringify(cacheEntry))
      
      mockSearchParams.get.mockReturnValue('2025020386')
      
      // Simulate network failure
      ;(global.fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<Home />)
      
      // Should show loading initially
      expect(screen.getByText('Loading play-by-play data...')).toBeInTheDocument()
      
      // Should load cached data and show offline banner
      await waitFor(() => {
        expect(screen.getByText('Offline Mode')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Verify no error message (data loaded from cache)
      expect(screen.queryByText(/Unable to Load Data/)).not.toBeInTheDocument()
    })

    it('should show error when no cache available and network fails', async () => {
      mockSearchParams.get.mockReturnValue('2025020386')
      
      // Simulate network failure with no cache
      ;(global.fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<Home />)
      
      // Should show error message without cached data
      await waitFor(() => {
        expect(screen.getByText(/Unable to Load Data|Connection Issue/)).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Should NOT show offline mode banner (no cached data)
      expect(screen.queryByText('Offline Mode')).not.toBeInTheDocument()
    })
  })

  describe('Offline Mode Banner', () => {
    it('should display offline mode banner with cached data', async () => {
      // Pre-populate cache
      const cacheKey = 'sploosh_cache_game_2025020386'
      const cacheEntry = {
        data: {
          playByPlayData: mockGameData.playByPlay,
          gameCenterData: mockGameData.gameCenter,
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000,
      }
      localStorageMock.setItem(cacheKey, JSON.stringify(cacheEntry))
      
      mockSearchParams.get.mockReturnValue('2025020386')
      ;(global.fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Offline Mode')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Verify banner message
      expect(screen.getByText(/Unable to connect to NHL servers/)).toBeInTheDocument()
      expect(screen.getByText(/Showing cached data from your last visit/)).toBeInTheDocument()
    })

    it('should have retry button in offline mode banner', async () => {
      // Pre-populate cache
      const cacheKey = 'sploosh_cache_game_2025020386'
      const cacheEntry = {
        data: {
          playByPlayData: mockGameData.playByPlay,
          gameCenterData: mockGameData.gameCenter,
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + 3600000,
      }
      localStorageMock.setItem(cacheKey, JSON.stringify(cacheEntry))
      
      mockSearchParams.get.mockReturnValue('2025020386')
      ;(global.fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText('Offline Mode')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Verify retry button exists (there may be multiple, just check one exists)
      const retryButtons = screen.getAllByText(/try again/i)
      expect(retryButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Cache Expiration', () => {
    it('should use stale cache when expired but network fails', async () => {
      // Pre-populate cache with expired data
      const cacheKey = 'sploosh_cache_game_2025020386'
      const cacheEntry = {
        data: {
          playByPlayData: mockGameData.playByPlay,
          gameCenterData: mockGameData.gameCenter,
        },
        timestamp: Date.now() - 7200000, // 2 hours ago
        expiresAt: Date.now() - 3600000, // Expired 1 hour ago
      }
      localStorageMock.setItem(cacheKey, JSON.stringify(cacheEntry))
      
      mockSearchParams.get.mockReturnValue('2025020386')
      ;(global.fetch as any).mockRejectedValue(new Error('Failed to fetch'))
      
      render(<Home />)
      
      // Should still load stale cached data
      await waitFor(() => {
        expect(screen.getByText('Offline Mode')).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Verify offline mode banner is shown (stale cache loaded)
      expect(screen.getByText('Offline Mode')).toBeInTheDocument()
    })
  })

  describe('Online to Offline Transition', () => {
    it('should not show banner when data loaded online before going offline', async () => {
      mockSearchParams.get.mockReturnValue('2025020386')
      
      // First load: online (successful)
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('play-by-play')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGameData.playByPlay),
          })
        }
        if (url.includes('game-center')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockGameData.gameCenter),
          })
        }
        return Promise.reject(new Error('Unknown endpoint'))
      })
      
      render(<Home />)
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByText('Loading play-by-play data...')).toBeNull()
      }, { timeout: 3000 })
      
      // Should NOT show offline banner (data loaded online)
      expect(screen.queryByText('Offline Mode')).not.toBeInTheDocument()
      
      // Verify loading completed
      expect(screen.queryByText('Loading play-by-play data...')).not.toBeInTheDocument()
    })
  })
})
