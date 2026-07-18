import { useState } from 'react'
import { Bone, CalendarDays, RotateCcw, ShieldCheck, Stethoscope } from 'lucide-react'
import { breeds } from './data/breeds'
import { calculateModelA, calculateModelC } from './lib/ageModels'
import { validateDogAgeInput } from './lib/validation'
import { BreedCombobox } from './components/BreedCombobox'
import { ResultsPanel } from './components/ResultsPanel'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

const mascotUrl = `${import.meta.env.BASE_URL}dog-mascot.svg`

export default function App() {
  const [breed, setBreed] = useState(null)
  const [years, setYears] = useState('')
  const [months, setMonths] = useState('0')
  const [errors, setErrors] = useState({})
  const [announcement, setAnnouncement] = useState('')
  const [result, setResult] = useState(null)
  const [resetVersion, setResetVersion] = useState(0)

  const calculate = (event) => {
    event.preventDefault()
    const validation = validateDogAgeInput({ breedName: breed?.name ?? '', years, months })
    if (!validation.valid) {
      setErrors(validation.errors)
      setAnnouncement(Object.values(validation.errors).join(' '))
      setResult(null)
      return
    }

    const nextResult = {
      breed,
      ageInYears: validation.ageInYears,
      modelA: calculateModelA(validation.ageInYears, breed.size),
      modelC: calculateModelC(validation.ageInYears, breed.lifespan),
    }
    setErrors({})
    setResult(nextResult)
    setAnnouncement(`${breed.name} results are ready.`)
  }

  const reset = () => {
    setBreed(null)
    setYears('')
    setMonths('0')
    setErrors({})
    setResult(null)
    setAnnouncement('Calculator reset.')
    setResetVersion((version) => version + 1)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream text-ink">
      <div className="pointer-events-none absolute -left-32 top-24 size-72 rounded-full bg-sun/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-[32rem] size-80 rounded-full bg-teal/10 blur-3xl" />

      <header className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-12 pt-8 sm:px-8 md:grid-cols-[1.25fr_0.75fr] md:pb-16 md:pt-12">
        <div>
          <div className="mb-8 flex items-center gap-3 text-sm font-black tracking-tight text-teal">
            <span className="grid size-10 place-items-center rounded-2xl bg-teal text-white"><Bone aria-hidden="true" className="size-5 -rotate-45" /></span>
            DOG AGE <span className="font-medium text-ink/45">by XRAI Studio</span>
          </div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-teal shadow-sm ring-1 ring-ink/5">
            <Stethoscope aria-hidden="true" className="size-4" /> Playful perspective, no exam room required
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
            How old are they, <span className="relative text-coral">really?<svg aria-hidden="true" viewBox="0 0 210 18" className="absolute -bottom-3 left-0 w-full text-sun"><path d="M3 12C45 3 133 3 207 9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="7" /></svg></span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink/65">One dog. Two honest, approximate human-age views — developmental pace and share of an average breed lifetime.</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-ink/60">
            <span className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-teal" /> Frontend-only</span>
            <span className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-teal" /> 81 breeds</span>
            <span className="flex items-center gap-2"><ShieldCheck aria-hidden="true" className="size-4 text-teal" /> No data saved</span>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute inset-6 rotate-6 rounded-[3rem] bg-sun" />
          <img src={mascotUrl} alt="Cheerful illustrated dog with a bandana" className="relative w-full -rotate-2 drop-shadow-2xl" />
          <div className="absolute -bottom-3 -left-4 rotate-[-5deg] rounded-2xl bg-white px-4 py-3 text-sm font-black shadow-lg">Two ages?!<span aria-hidden="true"> 🐾</span></div>
        </div>
      </header>

      <section aria-labelledby="calculator-heading" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid items-start gap-7 lg:grid-cols-[0.82fr_1.18fr]">
          <Card className="relative z-20">
            <CardHeader>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-coral">Quick check-in</p>
              <CardTitle id="calculator-heading">Tell us about your dog</CardTitle>
            </CardHeader>
            <CardContent>
              <form noValidate onSubmit={calculate} className="space-y-6">
                <BreedCombobox key={resetVersion} breeds={breeds} value={breed} onChange={setBreed} error={errors.breed} />
                <fieldset>
                  <legend className="mb-2 text-sm font-bold text-ink">Dog's age</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="years">Years</Label>
                      <Input id="years" inputMode="numeric" value={years} onChange={(event) => setYears(event.target.value)} aria-invalid={Boolean(errors.years || errors.age)} aria-describedby={errors.years ? 'years-error' : errors.age ? 'age-error' : undefined} placeholder="0" className="mt-2" />
                      {errors.years && <p id="years-error" className="mt-2 text-sm font-semibold text-[#b43f35]">{errors.years}</p>}
                    </div>
                    <div>
                      <Label htmlFor="months">Months</Label>
                      <Input id="months" inputMode="numeric" value={months} onChange={(event) => setMonths(event.target.value)} aria-invalid={Boolean(errors.months || errors.age)} aria-describedby={errors.months ? 'months-error' : errors.age ? 'age-error' : undefined} className="mt-2" />
                      {errors.months && <p id="months-error" className="mt-2 text-sm font-semibold text-[#b43f35]">{errors.months}</p>}
                    </div>
                  </div>
                  {errors.age && <p id="age-error" className="mt-2 text-sm font-semibold text-[#b43f35]">{errors.age}</p>}
                </fieldset>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button type="submit" size="lg" className="flex-1"><CalendarDays aria-hidden="true" className="size-5" /> Show their ages</Button>
                  <Button type="button" variant="outline" size="lg" onClick={reset} aria-label="Reset calculator"><RotateCcw aria-hidden="true" className="size-5" /></Button>
                </div>
                <p className="text-xs leading-5 text-ink/50">Ages are approximate and informational, never veterinary advice. The 30-year maximum is a typo guard, not a biological claim.</p>
              </form>
            </CardContent>
          </Card>
          <ResultsPanel result={result} />
        </div>
        <div role="status" aria-live="polite" className="sr-only">{announcement}</div>
      </section>

      <footer className="border-t border-ink/10 bg-white/55 px-5 py-8 text-center text-xs leading-5 text-ink/55">
        Model A follows a widely published staged convention. Model C compares life fraction with 78.8 human years. Life-stage labels are a friendly, non-clinical app convention.
      </footer>
    </main>
  )
}
