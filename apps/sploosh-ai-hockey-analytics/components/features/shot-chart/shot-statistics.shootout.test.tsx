/**
 * Shot statistics for a game decided in a shootout: the Goals line matches the
 * official score (shootout attempts are not counted, only the winning goal).
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ShotStatistics } from './shot-statistics'
import { parseShotsFromEdge } from '@/lib/utils/shot-chart-utils'
import { shootoutGame } from '@/lib/utils/shootout.fixture'

describe('ShotStatistics - shootout game', () => {
  it('shows DET 3 and SEA 4 goals, not the shootout attempts as extra goals', () => {
    render(<ShotStatistics gameData={shootoutGame} shotsForStats={parseShotsFromEdge(shootoutGame)} hasActiveFilters={false} />)
    const goalValues = screen.getAllByText('Goals').map((label) => label.nextElementSibling?.textContent)
    expect(goalValues).toEqual(['3', '4'])
  })
})
