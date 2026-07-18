const isWholeNumber = (value) => /^\d+$/.test(String(value))

export function validateDogAgeInput({ breedName, years, months }) {
  const errors = {}

  if (!breedName) errors.breed = 'Choose a breed to continue.'

  if (!isWholeNumber(years)) {
    errors.years = 'Enter years as a whole number from 0 to 30.'
  } else if (Number(years) > 30) {
    errors.years = 'The 30-year limit helps catch typos. Please check the age and try again.'
  }

  if (!isWholeNumber(months) || Number(months) > 11) {
    errors.months = 'Enter months as a whole number from 0 to 11.'
  }

  const parsedYears = Number(years)
  const parsedMonths = Number(months)
  if (!errors.years && !errors.months && parsedYears === 0 && parsedMonths === 0) {
    errors.age = 'Enter an age greater than zero months.'
  }

  if (Object.keys(errors).length) return { valid: false, ageInYears: null, errors }
  return { valid: true, ageInYears: parsedYears + parsedMonths / 12, errors: {} }
}
