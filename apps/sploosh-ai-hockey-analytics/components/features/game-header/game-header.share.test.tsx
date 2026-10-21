/**
 * Game Header - Share link and QR codes
 *
 * Verifies the Share link (Web Share API, clipboard fallback, correct URL)
 * and the QR codes under the NHL Game Center and Share links.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { GameHeader } from './game-header'
import { getGameShareUrl } from '@/lib/share-url'
import { SITE } from '@/lib/constants'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null })
}))

const gameData = {
  id: 2025020123,
  gameDate: '2026-10-21',
  gameState: 'FINAL',
  venue: { default: 'Test Arena' },
  awayTeam: { abbrev: 'SEA', score: 3 },
  homeTeam: { abbrev: 'VAN', score: 2 },
  gameCenterLink: '/gamecenter/2025020123/recap',
}

const expectedShareUrl = `${SITE.url}/?gameId=2025020123`
const expectedGameCenterUrl = 'https://www.nhl.com/gamecenter/2025020123/recap'

describe('getGameShareUrl', () => {
  it('builds the canonical URL for a game', () => {
    expect(getGameShareUrl(2025020123)).toBe(expectedShareUrl)
  })
})

describe('GameHeader - Share link', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a Share link', () => {
    render(<GameHeader gameData={gameData} />)
    expect(screen.getByRole('button', { name: /^share/i })).toBeInTheDocument()
  })

  it('uses the Web Share API with the canonical game URL when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    render(<GameHeader gameData={gameData} />)
    fireEvent.click(screen.getByRole('button', { name: /^share/i }))

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    expect(share.mock.calls[0][0].url).toBe(expectedShareUrl)
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
  })

  it('copies the link and confirms when Web Share is unavailable', async () => {
    render(<GameHeader gameData={gameData} />)
    fireEvent.click(screen.getByRole('button', { name: /^share/i }))

    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedShareUrl)
    )
    expect(await screen.findByText(/link copied/i)).toBeInTheDocument()
  })

  it('tells the user when the link cannot be copied', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })

    render(<GameHeader gameData={gameData} />)
    fireEvent.click(screen.getByRole('button', { name: /^share/i }))

    expect(await screen.findByText(/couldn't copy link/i)).toBeInTheDocument()
  })

  it('does not fall back to the clipboard when the user cancels the share sheet', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    render(<GameHeader gameData={gameData} />)
    fireEvent.click(screen.getByRole('button', { name: /^share/i }))

    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled()
    expect(screen.queryByText(/link copied/i)).not.toBeInTheDocument()
  })
})

describe('GameHeader - QR codes', () => {
  it('renders a labelled QR code for the Game Center link and the share link', () => {
    render(<GameHeader gameData={gameData} />)
    expect(screen.getByRole('img', { name: /qr code.*nhl game center/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /qr code for sploosh\.ai hockey analytics/i })).toBeInTheDocument()
  })

  it('encodes the right URL in each QR code', () => {
    render(<GameHeader gameData={gameData} />)
    expect(screen.getByTestId('qr-game-center')).toHaveAttribute('data-url', expectedGameCenterUrl)
    expect(screen.getByTestId('qr-share')).toHaveAttribute('data-url', expectedShareUrl)
  })

  it('hides both QR codes but keeps the links when showQrCodes is false', () => {
    render(<GameHeader gameData={gameData} showQrCodes={false} />)
    expect(screen.queryByTestId('qr-share')).not.toBeInTheDocument()
    expect(screen.queryByTestId('qr-game-center')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^share/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nhl® game center/i })).toBeInTheDocument()
  })

  it('omits the Game Center QR code when there is no Game Center link', () => {
    render(<GameHeader gameData={{ ...gameData, gameCenterLink: undefined }} />)
    expect(screen.queryByTestId('qr-game-center')).not.toBeInTheDocument()
    expect(screen.getByTestId('qr-share')).toBeInTheDocument()
  })
})

describe('GameHeader - QR code labels and separation', () => {
  const cardFor = (testId: string) => screen.getByTestId(testId).closest('figure') as HTMLElement

  it('labels the Sploosh.AI code and the NHL code, each tied to its own code', () => {
    render(<GameHeader gameData={gameData} />)
    expect(within(cardFor('qr-share')).getByText('Sploosh.AI Hockey Analytics')).toBeInTheDocument()
    expect(within(cardFor('qr-share')).queryByText(/NHL/)).not.toBeInTheDocument()
    expect(within(cardFor('qr-game-center')).getByText(/NHL® Game Center/)).toBeInTheDocument()
    expect(within(cardFor('qr-game-center')).queryByText('Sploosh.AI Hockey Analytics')).not.toBeInTheDocument()
  })

  it('gives each code its own visual treatment', () => {
    render(<GameHeader gameData={gameData} />)
    expect(cardFor('qr-share')).toHaveAttribute('data-variant', 'sploosh')
    expect(cardFor('qr-game-center')).toHaveAttribute('data-variant', 'nhl')
  })

  it('separates the two codes with a divider so a camera does not see both', () => {
    render(<GameHeader gameData={gameData} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('keeps the two footer cards aligned: each sits directly under a same-shaped link row', () => {
    render(<GameHeader gameData={gameData} />)
    const rowFor = (id: string) => cardFor(id).previousElementSibling as HTMLElement
    expect(rowFor('qr-share').tagName).toBe(rowFor('qr-game-center').tagName)
    expect(rowFor('qr-share').className).toBe(rowFor('qr-game-center').className)
    expect(within(rowFor('qr-share')).getByRole('button', { name: /^share/i })).toBeInTheDocument()
    expect(within(rowFor('qr-game-center')).getByRole('button', { name: /nhl® game center/i })).toBeInTheDocument()
  })
})
