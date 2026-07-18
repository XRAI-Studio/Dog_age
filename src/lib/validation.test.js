import { describe, expect, it } from 'vitest'
import { validateDogAgeInput } from './validation'

describe('dog age input validation', () => {
  it('accepts a valid whole-year and whole-month age', () => {
    expect(validateDogAgeInput({ breedName: 'Beagle', years: '4', months: '6' })).toEqual({
      valid: true,
      ageInYears: 4.5,
      errors: {},
    })
  })

  it.each([
    [{ breedName: '', years: '1', months: '0' }, 'breed'],
    [{ breedName: 'Beagle', years: '0', months: '0' }, 'age'],
    [{ breedName: 'Beagle', years: '', months: '1' }, 'years'],
    [{ breedName: 'Beagle', years: '2.5', months: '0' }, 'years'],
    [{ breedName: 'Beagle', years: '-1', months: '0' }, 'years'],
    [{ breedName: 'Beagle', years: '31', months: '0' }, 'years'],
    [{ breedName: 'Beagle', years: '300', months: '0' }, 'years'],
    [{ breedName: 'Beagle', years: '1', months: '1.5' }, 'months'],
    [{ breedName: 'Beagle', years: '1', months: '-1' }, 'months'],
    [{ breedName: 'Beagle', years: '1', months: '12' }, 'months'],
    [{ breedName: 'Beagle', years: 'dogs', months: '2' }, 'years'],
  ])('rejects invalid input %#', (input, errorKey) => {
    const result = validateDogAgeInput(input)
    expect(result.valid).toBe(false)
    expect(result.errors[errorKey]).toBeTruthy()
  })

  it('explains that the 30-year cap is an input guard', () => {
    const result = validateDogAgeInput({ breedName: 'Beagle', years: '31', months: '0' })
    expect(result.errors.years).toMatch(/30-year limit.*typos/i)
  })

  it('allows ages beyond a breed lifespan', () => {
    expect(validateDogAgeInput({ breedName: 'Beagle', years: '20', months: '0' }).valid).toBe(true)
  })
})
