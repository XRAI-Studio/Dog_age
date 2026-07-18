// These thresholds are a non-clinical, app-defined convention informed by
// AAHA canine life-stage guidance: https://www.aaha.org/resources/2023-aaha-senior-care-guidelines-for-dogs-and-cats/
export function getLifeStage(ageInYears, lifespan) {
  if (ageInYears < 1) return 'puppy'
  const fraction = ageInYears / lifespan
  if (fraction < 0.5) return 'adult'
  if (fraction < 0.75) return 'senior'
  return 'geriatric'
}

export function getLifeProgress(ageInYears, lifespan) {
  const fraction = ageInYears / lifespan
  const percentage = fraction * 100
  return {
    fraction,
    percentage,
    visualPercentage: Math.min(100, Math.max(0, percentage)),
  }
}
