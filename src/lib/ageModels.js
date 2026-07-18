export const SIZE_YEARLY_INCREMENTS = Object.freeze({
  small: 4,
  medium: 5,
  large: 6,
  giant: 7,
})

// The first-year (15) and second-year (+9) stages, and the 4/5/6/7 yearly
// size increments, follow the AKC's published dog-age convention:
// https://www.akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years/
export function calculateModelA(ageInYears, size) {
  if (!Number.isFinite(ageInYears) || ageInYears < 0) throw new RangeError('Age must be zero or greater.')
  const increment = SIZE_YEARLY_INCREMENTS[size]
  if (!increment) throw new RangeError('Unknown dog size.')

  if (ageInYears <= 1) return 15 * ageInYears
  if (ageInYears <= 2) return 15 + 9 * (ageInYears - 1)
  return 24 + increment * (ageInYears - 2)
}

// 78.8 is retained from the original 1st_web app as its US human-life
// expectancy reference. Applying it linearly is an app-defined comparison,
// not a clinical or biological model.
export const HUMAN_LIFE_EXPECTANCY = 78.8

export function calculateModelC(ageInYears, breedLifespan) {
  if (!Number.isFinite(ageInYears) || ageInYears < 0) throw new RangeError('Age must be zero or greater.')
  if (!Number.isFinite(breedLifespan) || breedLifespan <= 0) throw new RangeError('Lifespan must be positive.')
  return (ageInYears / breedLifespan) * HUMAN_LIFE_EXPECTANCY
}
