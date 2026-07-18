import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BreedCombobox } from './BreedCombobox'

const options = [
  { name: 'Beagle' },
  { name: 'Bernese Mountain Dog' },
  { name: 'Golden Retriever' },
]

describe('BreedCombobox', () => {
  it('filters and selects with the keyboard while retaining focus', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<BreedCombobox breeds={options} value="" onChange={onChange} error="" />)

    const input = screen.getByRole('combobox', { name: /breed/i })
    expect(input).toHaveAttribute('aria-expanded', 'false')
    await user.click(input)
    await user.type(input, 'gold')
    expect(screen.getByRole('option', { name: 'Golden Retriever' })).toBeVisible()
    expect(screen.queryByRole('option', { name: 'Beagle' })).not.toBeInTheDocument()
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onChange).toHaveBeenCalledWith(options[2])
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('supports arrow navigation and escape without moving focus', async () => {
    const user = userEvent.setup()
    render(<BreedCombobox breeds={options} value="" onChange={() => {}} error="" />)
    const input = screen.getByRole('combobox', { name: /breed/i })
    await user.click(input)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', expect.stringContaining('option-1'))
    await user.keyboard('{Escape}')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveFocus()
  })

  it('clears its visible text when the controlled value is reset', () => {
    const { rerender } = render(<BreedCombobox breeds={options} value={options[0]} onChange={() => {}} error="" />)
    expect(screen.getByRole('combobox', { name: /breed/i })).toHaveValue('Beagle')
    rerender(<BreedCombobox breeds={options} value={null} onChange={() => {}} error="" />)
    expect(screen.getByRole('combobox', { name: /breed/i })).toHaveValue('')
  })

  it('preserves replacement text while clearing the previous controlled selection', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [selected, setSelected] = useState(options[0])
      return <BreedCombobox breeds={options} value={selected} onChange={setSelected} error="" />
    }
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: /breed/i })
    fireEvent.change(input, { target: { value: 'gold' } })
    expect(input).toHaveValue('gold')
    input.focus()
    await user.keyboard('{ArrowDown}{Enter}')
    expect(input).toHaveValue('Golden Retriever')
  })
})
