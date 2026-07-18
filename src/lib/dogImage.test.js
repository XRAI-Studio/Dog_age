import { describe, expect, it } from 'vitest'
import { buildDogCeoUrl, validateDogImagePayload } from './dogImage'

describe('dog.ceo image helpers', () => {
  it('builds a breed URL without a sub-breed', () => {
    expect(buildDogCeoUrl({ dogceo_breed: 'beagle', dogceo_sub_breed: null })).toBe(
      'https://dog.ceo/api/breed/beagle/images/random',
    )
  })

  it('builds a URL with an explicit sub-breed', () => {
    expect(buildDogCeoUrl({ dogceo_breed: 'retriever', dogceo_sub_breed: 'golden' })).toBe(
      'https://dog.ceo/api/breed/retriever/golden/images/random',
    )
  })

  it.each([
    [{ status: 'error', message: 'https://images.dog.ceo/dog.jpg' }, false],
    [{ status: 'success', message: 'http://images.dog.ceo/dog.jpg' }, false],
    [{ status: 'success', message: 'https://evil.example/dog.jpg' }, false],
    [{ status: 'success', message: 42 }, false],
    [null, false],
    [{ status: 'success', message: 'https://images.dog.ceo/breeds/beagle/dog.jpg' }, true],
  ])('validates image payload %#', (payload, expected) => {
    expect(validateDogImagePayload(payload)).toBe(expected)
  })
})
