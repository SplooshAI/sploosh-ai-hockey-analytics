/**
 * Home Page - NHL Games header after switching games
 *
 * Bug: On hockey-preview, open ?gameId=A, click game B in the sidebar, then click
 * the "NHL Games" header: it navigated back to game A instead of the empty root view.
 * Game selection updates the URL through window.history.replaceState, which leaves the
 * Next.js router's own idea of the current URL stale, so router.push('/') resolved to
 * the stale ?gameId=A. In jsdom the stale router is emulated by a router whose push()
 * never changes the location.
 * Fix: the header navigates through the History API like game selection does.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { useSyncExternalStore } from 'react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Home from './page'

vi.mock('next/navigation', () => {
  const subscribe = (cb: () => void) => {
    window.addEventListener('locationchange', cb)
    return () => window.removeEventListener('locationchange', cb)
  }
  const getSnapshot = () => window.location.search
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => {
      const search = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
      return new URLSearchParams(search)
    },
  }
})

global.fetch = vi.fn()

const gameJson = (id: number) => ({
  id,
  gameState: 'OFF',
  gameDate: '2026-10-21',
  awayTeam: { abbrev: 'AWAY' },
  homeTeam: { abbrev: 'HOME' },
})

describe('Home Page - NHL Games header after switching games', () => {
  const originalPushState = window.history.pushState.bind(window.history)
  const originalReplaceState = window.history.replaceState.bind(window.history)

  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState = (...args) => {
      originalPushState(...args)
      window.dispatchEvent(new Event('locationchange'))
    }
    window.history.replaceState = (...args) => {
      originalReplaceState(...args)
      window.dispatchEvent(new Event('locationchange'))
    }
    originalReplaceState({}, '', '/?gameId=2026020149')
    ;(global.fetch as any).mockImplementation((url: string) => {
      const id = Number(new URL(url, 'http://localhost').searchParams.get('gameId') ?? 0)
      if (url.includes('scores')) return Promise.resolve({ ok: true, json: async () => ({ games: [] }) })
      return Promise.resolve({ ok: true, json: async () => gameJson(id) })
    })
  })

  afterEach(() => {
    window.history.pushState = originalPushState
    window.history.replaceState = originalReplaceState
    originalReplaceState({}, '', '/')
  })

  it('returns to the empty root view and URL, not the first game', async () => {
    render(<Home />)
    await waitFor(() => expect(screen.getByText('Raw Game Data (JSON)')).toBeInTheDocument())

    // Switch games the way handleGameSelect does: History API only, router never told
    act(() => {
      window.history.replaceState({}, '', '/?gameId=2026020152')
    })

    fireEvent.click(screen.getByText('NHL Games'))

    await waitFor(() => expect(screen.queryByText('Raw Game Data (JSON)')).toBeNull())
    expect(window.location.search).toBe('')
  })
})
