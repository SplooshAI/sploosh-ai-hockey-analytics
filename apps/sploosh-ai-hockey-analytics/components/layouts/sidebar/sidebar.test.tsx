/**
 * Sidebar - NHL Games header regression test
 *
 * Bug: With a date other than today selected in the sidebar (or a game open),
 * clicking the "NHL Games" header did nothing visible. It only called
 * router.push('/'), which is a no-op when the URL has no gameId, and the
 * selected date lives in local state so it was never reset.
 * Fix: the header resets the selected date to today and navigates to the root.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import Sidebar from './sidebar'

const renderedDates = vi.hoisted(() => [] as Date[])

vi.mock('@/components/features/games/list/games-list', () => ({
  GamesList: ({ date }: { date: Date }) => {
    renderedDates.push(date)
    return <div data-testid="games-list-date">{date.toDateString()}</div>
  },
}))

vi.mock('@/components/features/games/date-picker/games-date-picker', () => ({
  GamesDatePicker: ({ onDateChange }: { onDateChange: (d: Date) => void }) => (
    <button onClick={() => onDateChange(new Date(2026, 9, 20))}>pick Oct 20</button>
  ),
}))

vi.mock('../../shared/version/version', () => ({ Version: () => null }))
vi.mock('../../shared/nhl-attribution/nhl-attribution', () => ({ NHLAttribution: () => null }))

describe('Sidebar - NHL Games header', () => {
  const pushState = vi.spyOn(window.history, 'pushState')

  beforeEach(() => {
    vi.clearAllMocks()
    renderedDates.length = 0
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 21, 10, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('navigates to the root URL when the header is clicked', () => {
    render(<Sidebar />)

    fireEvent.click(screen.getByText('NHL Games'))

    expect(pushState).toHaveBeenCalledWith(null, '', '/')
  })

  it('resets the selected date to today when the header is clicked', () => {
    render(<Sidebar />)
    expect(screen.getByTestId('games-list-date').textContent).toBe(new Date(2026, 9, 21).toDateString())

    fireEvent.click(screen.getByText('pick Oct 20'))
    expect(screen.getByTestId('games-list-date').textContent).toBe(new Date(2026, 9, 20).toDateString())

    fireEvent.click(screen.getByText('NHL Games'))

    expect(screen.getByTestId('games-list-date').textContent).toBe(new Date(2026, 9, 21).toDateString())
  })

  it('keeps the same date object when already on today so the list does not refetch', () => {
    render(<Sidebar />)
    const initialDate = renderedDates[0]
    renderedDates.length = 0

    fireEvent.click(screen.getByText('NHL Games'))

    expect(renderedDates.every(d => d === initialDate)).toBe(true)
  })
})
