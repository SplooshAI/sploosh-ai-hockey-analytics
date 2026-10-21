/**
 * MainLayout - mobile sidebar on first load
 *
 * A bare URL on mobile opens the sidebar so a game can be picked. A link that
 * already names a game (a shared link, a QR scan) opens with the sidebar closed.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MainLayout } from './main-layout'

vi.mock('./sidebar/sidebar', () => ({
  default: () => <div data-testid="sidebar" />,
}))

const sidebarPanel = () => screen.getByTestId('sidebar').parentElement as HTMLElement

const setViewport = (width: number) =>
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })

describe('MainLayout - sidebar on first load', () => {
  const originalWidth = window.innerWidth

  beforeEach(() => setViewport(375))
  afterEach(() => {
    setViewport(originalWidth)
    window.history.replaceState({}, '', '/')
  })

  it('opens the sidebar on mobile for a bare URL', () => {
    window.history.replaceState({}, '', '/')
    render(<MainLayout><div /></MainLayout>)
    expect(sidebarPanel().className).toContain('translate-x-0')
    expect(sidebarPanel().className).not.toContain('-translate-x-full')
  })

  it('keeps the sidebar closed on mobile when the URL names a game', () => {
    window.history.replaceState({}, '', '/?gameId=2026020141')
    render(<MainLayout><div /></MainLayout>)
    expect(sidebarPanel().className).toContain('-translate-x-full')
  })

  it('does not open the sidebar overlay on desktop widths', () => {
    setViewport(1280)
    window.history.replaceState({}, '', '/')
    render(<MainLayout><div /></MainLayout>)
    expect(sidebarPanel().className).toContain('-translate-x-full')
  })
})
