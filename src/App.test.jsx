import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => vi.unstubAllGlobals())

describe('Dogs True Age v2 app', () => {
  it('announces validation errors and then shows both model results', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 500,
      json: vi.fn(),
    }))
    render(<App />)

    await user.click(screen.getByRole('button', { name: /show their ages/i }))
    expect(screen.getByRole('status')).toHaveTextContent(/choose a breed/i)

    const combo = screen.getByRole('combobox', { name: /breed/i })
    await user.click(combo)
    await user.type(combo, 'beagle')
    await user.keyboard('{ArrowDown}{Enter}')
    await user.clear(screen.getByLabelText(/^years$/i))
    await user.type(screen.getByLabelText(/^years$/i), '5')
    await user.click(screen.getByRole('button', { name: /show their ages/i }))

    expect(await screen.findByText(/your dog's point of view/i)).toBeVisible()
    expect(screen.getByText(/our point of view/i)).toBeVisible()
    expect(await screen.findByText('39.0')).toBeVisible()
    expect(await screen.findByText('31.5')).toBeVisible()
    expect(screen.getByText(/adult/i)).toBeVisible()
  })

  it('clears unselected breed search text when reset', async () => {
    const user = userEvent.setup()
    render(<App />)
    const combo = screen.getByRole('combobox', { name: /breed/i })
    await user.type(combo, 'gold')
    await user.click(screen.getByRole('button', { name: /reset calculator/i }))
    expect(screen.getByRole('combobox', { name: /breed/i })).toHaveValue('')
  })
})
