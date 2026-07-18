import { describe, expect, it } from 'vitest'
import { calculateModelA, calculateModelC } from './ageModels'

describe('Model A', () => {
  it.each([
    [0, 'small', 0],
    [0.5, 'small', 7.5],
    [1, 'small', 15],
    [1.5, 'small', 19.5],
    [2, 'small', 24],
    [5, 'small', 36],
    [5, 'medium', 39],
    [5, 'large', 42],
    [5, 'giant', 45],
  ])('maps %s years for %s dogs to %s human years', (age, size, expected) => {
    expect(calculateModelA(age, size)).toBe(expected)
  })
})

describe('Model C', () => {
  it('calculates the linear life fraction', () => {
    expect(calculateModelC(6, 12)).toBeCloseTo(39.4)
  })

  it('does not clamp dogs older than the breed average lifespan', () => {
    expect(calculateModelC(15, 12)).toBeCloseTo(98.5)
  })
})
