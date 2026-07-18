import { describe, expect, it } from 'vitest'
import breeds from './breeds.json'

const expectedSize = (midpoint) => {
  if (midpoint < 20) return 'small'
  if (midpoint < 50) return 'medium'
  if (midpoint < 90) return 'large'
  return 'giant'
}

describe('breed dataset integrity', () => {
  it('contains every legacy breed exactly once', () => {
    expect(breeds).toHaveLength(81)
    expect(new Set(breeds.map(({ name }) => name)).size).toBe(breeds.length)
  })

  it('keeps all seeded provenance and derived fields internally consistent', () => {
    for (const breed of breeds) {
      expect(breed.name).toBeTruthy()
      expect(breed.lifespan).toBeGreaterThan(0)
      expect(breed.lifespan_range[0]).toBeLessThanOrEqual(breed.lifespan_range[1])
      const roundedMidpoint = Math.round(((breed.lifespan_range[0] + breed.lifespan_range[1]) / 2) * 2) / 2
      expect(breed.lifespan).toBe(roundedMidpoint)
      expect(breed.lifespan_source).toBe('SEED-1st_web')
      expect(breed.lifespan_source_url).toBe('')
      expect(breed.weight_source).toBe('SEED-estimate')
      expect(breed.weight_source_url).toBe('')
      expect(breed.access_date).toBe('')
      expect(breed.notes).toBe('PENDING human lifespan/weight verification')
      expect(breed.weight_midpoint_lb).toBe((breed.weight_lb[0] + breed.weight_lb[1]) / 2)
      expect(breed.size).toBe(expectedSize(breed.weight_midpoint_lb))

      if (breed.image_is_substitute) {
        expect(breed.dogceo_breed).toBeNull()
        expect(breed.dogceo_sub_breed).toBeNull()
      } else {
        expect(breed.dogceo_breed).toBeTruthy()
      }
    }
  })

  it.each(['English Cocker Spaniel', 'Siberian Husky'])('uses the local substitute for ambiguous catalog label: %s', (name) => {
    expect(breeds.find((breed) => breed.name === name)?.image_is_substitute).toBe(true)
  })
})
