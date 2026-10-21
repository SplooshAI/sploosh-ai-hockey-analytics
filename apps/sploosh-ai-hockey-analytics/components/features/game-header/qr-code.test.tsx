/**
 * QR cards - consistent styling, side-by-side layout and scannability
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import jsQR from 'jsqr'
import { GameQrCodes } from './game-qr-codes'
import { getGameShareUrl } from '@/lib/share-url'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

const props = { gameId: 2026020141, gameCenterLink: '/gamecenter/2026020141/recap' }
const shareUrl = getGameShareUrl(2026020141)
const gameCenterUrl = 'https://www.nhl.com/gamecenter/2026020141/recap'

const cardFor = (testId: string) => screen.getByTestId(testId).closest('figure') as HTMLElement

/** Rasterize the rendered QR SVG (dark modules are `M x y h<run>v1H x z` runs) and decode it. */
const RUN = /M(\d+)[ ,](\d+) ?h(\d+)v1H\d+z/g
const decode = (testId: string): string | undefined => {
  const svg = screen.getByTestId(testId).querySelector('svg') as SVGSVGElement
  const size = Number(svg.getAttribute('viewBox')!.split(' ')[2])
  const scale = 8
  const px = size * scale
  const [bgPath, fgPath] = Array.from(svg.querySelectorAll('path'))
  expect(bgPath.getAttribute('fill')).toBe('#ffffff')
  expect(fgPath.getAttribute('fill')).toBe('#000000')
  const data = new Uint8ClampedArray(px * px * 4).fill(255)
  for (const [, x, y, run] of fgPath.getAttribute('d')!.matchAll(RUN)) {
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < Number(run) * scale; dx++) {
        const i = ((Number(y) * scale + dy) * px + Number(x) * scale + dx) * 4
        data[i] = data[i + 1] = data[i + 2] = 0
      }
    }
  }
  return jsQR(data, px, px)?.data
}

describe('QR cards', () => {
  afterEach(() => document.documentElement.classList.remove('dark'))

  it('lays the two cards out side by side from the sm breakpoint, stacked below it', () => {
    render(<GameQrCodes {...props} />)
    const row = cardFor('qr-share').parentElement as HTMLElement
    expect(row).toBe(cardFor('qr-game-center').parentElement)
    expect(row.className).toContain('flex-col')
    expect(row.className).toContain('sm:flex-row')
  })

  it('gives both codes the same plain card styling, with no tint on either', () => {
    render(<GameQrCodes {...props} />)
    const classes = (id: string) => cardFor(id).className.replace(/\s+/g, ' ')
    expect(classes('qr-share')).toBe(classes('qr-game-center'))
    expect(classes('qr-share')).not.toMatch(/blue|tint|accent/)
  })

  it('renders both codes in black on white with a quiet zone', () => {
    render(<GameQrCodes {...props} />)
    for (const id of ['qr-share', 'qr-game-center']) {
      const svg = screen.getByTestId(id).querySelector('svg') as SVGSVGElement
      const [bg, fg] = Array.from(svg.querySelectorAll('path'))
      expect(bg.getAttribute('fill')).toBe('#ffffff')
      expect(fg.getAttribute('fill')).toBe('#000000')
      // the first dark module starts at least 4 modules in from the edge
      const xs = [...fg.getAttribute('d')!.matchAll(RUN)].map(m => Number(m[1]))
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(4)
    }
  })

  it.each([['light', false], ['dark', true]])('decodes both codes to the right URLs in the %s theme', (_name, dark) => {
    if (dark) document.documentElement.classList.add('dark')
    render(<GameQrCodes {...props} />)
    expect(decode('qr-share')).toBe(shareUrl)
    expect(decode('qr-game-center')).toBe(gameCenterUrl)
  })

  it('makes each QR code a link that opens its own URL in a new tab', () => {
    render(<GameQrCodes {...props} />)
    const share = screen.getByRole('link', { name: /sploosh\.ai hockey analytics/i })
    const nhl = screen.getByRole('link', { name: /nhl® game center/i })
    expect(share).toHaveAttribute('href', shareUrl)
    expect(nhl).toHaveAttribute('href', gameCenterUrl)
    for (const link of [share, nhl]) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('rel')).toContain('noreferrer')
    }
  })

  it('wraps each QR image in its own link, not the other one', () => {
    render(<GameQrCodes {...props} />)
    expect(screen.getByTestId('qr-share').closest('a')).toHaveAttribute('href', shareUrl)
    expect(screen.getByTestId('qr-game-center').closest('a')).toHaveAttribute('href', gameCenterUrl)
  })
})
