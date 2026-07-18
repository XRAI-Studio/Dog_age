import { describe, expect, it } from 'vitest'
import { getLifeProgress, getLifeStage } from './lifeStage'

describe('life stages', () => {
  it.each([
    [0.999, 12, 'puppy'],
    [1, 12, 'adult'],
    [5.999, 12, 'adult'],
    [6, 12, 'senior'],
    [8.999, 12, 'senior'],
    [9, 12, 'geriatric'],
    [15, 12, 'geriatric'],
  ])('classifies age %s with lifespan %s as %s', (age, lifespan, stage) => {
    expect(getLifeStage(age, lifespan)).toBe(stage)
  })

  it('clamps only the visual progress while retaining the true fraction', () => {
    expect(getLifeProgress(15, 12)).toEqual({ fraction: 1.25, percentage: 125, visualPercentage: 100 })
  })
})
