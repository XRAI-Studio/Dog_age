import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DogPhoto } from './DogPhoto'

const beagle = { name: 'Beagle', dogceo_breed: 'beagle', dogceo_sub_breed: null, image_is_substitute: false }
const golden = { name: 'Golden Retriever', dogceo_breed: 'retriever', dogceo_sub_breed: 'golden', image_is_substitute: false }

const response = (url) => Promise.resolve({
  status: 200,
  json: () => Promise.resolve({ status: 'success', message: url }),
})

afterEach(() => vi.unstubAllGlobals())

describe('DogPhoto', () => {
  it('uses the bundled fallback and hides reroll for substitute breeds', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<DogPhoto breed={{ ...beagle, name: 'Alaskan Klee Kai', image_is_substitute: true }} />)
    expect(screen.getByRole('img', { name: 'Generic dog illustration for Alaskan Klee Kai' })).toHaveAttribute(
      'src', expect.stringContaining('generic-dog.svg'),
    )
    expect(screen.queryByRole('button', { name: /fetch another/i })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('falls back when the accepted remote image fails to render', async () => {
    vi.stubGlobal('fetch', vi.fn(() => response('https://images.dog.ceo/breeds/beagle/one.jpg')))
    render(<DogPhoto breed={beagle} />)
    const image = await screen.findByRole('img', { name: 'Beagle dog photo' })
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', expect.stringContaining('generic-dog.svg'))
    expect(image).toHaveAttribute('alt', 'Generic dog illustration for Beagle')
  })

  it('discards a stale response after the breed changes', async () => {
    let resolveFirst
    let resolveSecond
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve }))
      .mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve }))
    vi.stubGlobal('fetch', fetchMock)
    const { rerender } = render(<DogPhoto breed={beagle} />)
    rerender(<DogPhoto breed={golden} />)

    await act(async () => {
      resolveSecond(await response('https://images.dog.ceo/breeds/retriever-golden/two.jpg'))
    })
    expect(await screen.findByRole('img', { name: 'Golden Retriever dog photo' })).toHaveAttribute('src', expect.stringContaining('two.jpg'))

    await act(async () => {
      resolveFirst(await response('https://images.dog.ceo/breeds/beagle/one.jpg'))
    })
    expect(screen.getByRole('img', { name: 'Golden Retriever dog photo' })).toHaveAttribute('src', expect.stringContaining('two.jpg'))
  })

  it('does not show the previous breed photo while the next breed loads', async () => {
    let resolveSecond
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(response('https://images.dog.ceo/breeds/beagle/ready.jpg'))
      .mockReturnValueOnce(new Promise((resolve) => { resolveSecond = resolve }))
    vi.stubGlobal('fetch', fetchMock)
    const { rerender } = render(<DogPhoto breed={beagle} />)
    expect(await screen.findByRole('img', { name: 'Beagle dog photo' })).toHaveAttribute('src', expect.stringContaining('beagle/ready.jpg'))

    rerender(<DogPhoto breed={golden} />)
    expect(screen.getByRole('img', { name: 'Generic dog illustration for Golden Retriever' })).toHaveAttribute(
      'src', expect.stringContaining('generic-dog.svg'),
    )

    await act(async () => {
      resolveSecond(await response('https://images.dog.ceo/breeds/retriever-golden/ready.jpg'))
    })
  })

  it('exposes accessible loading and reroll states', async () => {
    const user = userEvent.setup()
    let resolveFetch
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => { resolveFetch = resolve })))
    render(<DogPhoto breed={beagle} />)
    const region = screen.getByTestId('dog-photo')
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('button', { name: /fetch another/i })).toBeDisabled()

    await act(async () => {
      resolveFetch(await response('https://images.dog.ceo/breeds/beagle/ready.jpg'))
    })
    expect(region).toHaveAttribute('aria-busy', 'false')
    await user.click(screen.getByRole('button', { name: /fetch another/i }))
    expect(region).toHaveAttribute('aria-busy', 'true')
  })
})
