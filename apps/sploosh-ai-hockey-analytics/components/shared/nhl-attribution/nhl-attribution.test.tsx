/**
 * NHLAttribution - sidebar card
 *
 * The sidebar variant is a card matching the version card: a header (icon, title, subtitle),
 * then the required NHL trademark and copyright notices, then the disclaimer. The legal text
 * itself is unchanged.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NHLAttribution } from './nhl-attribution'

describe('NHLAttribution sidebar variant', () => {
  it('renders everything inside one card with a header', () => {
    render(<NHLAttribution variant="sidebar" />)

    const card = screen.getByTestId('nhl-attribution-card')
    expect(card).toHaveTextContent('NHL Data')
    expect(card).toHaveTextContent('Legal notices')
    expect(card.querySelector('svg')).not.toBeNull()
  })

  it('keeps the required notices and the disclaimer', () => {
    render(<NHLAttribution variant="sidebar" />)

    const card = screen.getByTestId('nhl-attribution-card')
    expect(card).toHaveTextContent('NHL, the NHL Shield, and NHL EDGE are registered trademarks of the National Hockey League.')
    expect(card).toHaveTextContent('NHL and NHL team marks are the property of the NHL and its teams.')
    expect(card).toHaveTextContent(`© NHL ${new Date().getFullYear()}. All Rights Reserved.`)
    expect(card).toHaveTextContent('We are not affiliated with or endorsed by the NHL.')
  })
})

describe('NHLAttribution footer variant', () => {
  it('is unchanged', () => {
    render(<NHLAttribution variant="footer" />)

    expect(screen.queryByTestId('nhl-attribution-card')).toBeNull()
    expect(screen.getByText('NHL Trademarks:')).toBeInTheDocument()
    expect(screen.getByText('Disclaimer:')).toBeInTheDocument()
  })
})
