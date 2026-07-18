import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnimatedNumber } from './AnimatedNumber'

describe('AnimatedNumber', () => {
  it('renders the final value immediately when reduced motion is preferred', () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render(<AnimatedNumber value={42} />)
    expect(screen.getAllByText('42.0')).toHaveLength(2)
    window.matchMedia = original
  })
})
