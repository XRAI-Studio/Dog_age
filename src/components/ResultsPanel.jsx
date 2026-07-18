import { HeartPulse, PawPrint, Sparkles } from 'lucide-react'
import { getLifeProgress, getLifeStage } from '../lib/lifeStage'
import { AnimatedNumber } from './AnimatedNumber'
import { DogPhoto } from './DogPhoto'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'

const stageCopy = {
  puppy: 'Puppy',
  adult: 'Adult',
  senior: 'Senior',
  geriatric: 'Geriatric',
}

export function ResultsPanel({ result }) {
  if (!result) {
    return (
      <Card className="flex min-h-[480px] items-center justify-center border-dashed bg-white/60 p-8 text-center">
        <div className="max-w-xs">
          <span className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-sun/25 text-teal">
            <PawPrint aria-hidden="true" className="size-10" />
          </span>
          <h2 className="text-2xl font-black text-ink">A little perspective is coming</h2>
          <p className="mt-2 text-sm leading-6 text-ink/65">Choose a breed and age to see two approximate human-age views.</p>
        </div>
      </Card>
    )
  }

  const { breed, ageInYears, modelA, modelC } = result
  const progress = getLifeProgress(ageInYears, breed.lifespan)
  const stage = getLifeStage(ageInYears, breed.lifespan)
  const beyond = progress.fraction > 1

  return (
    <Card className="overflow-hidden" aria-label={`${breed.name} age results`}>
      <div className="grid gap-6 bg-gradient-to-br from-[#e6f4ef] to-cream p-5 sm:p-7 md:grid-cols-[0.9fr_1.1fr]">
        <DogPhoto breed={breed} />
        <div className="self-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal">The readout</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-ink">{breed.name}</h2>
          <p className="mt-1 text-sm text-ink/60">{ageInYears.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} actual years · {breed.size} size class</p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge>{stageCopy[stage]} stage</Badge>
            <span className="text-xs text-ink/55">friendly, non-clinical label</span>
          </div>
        </div>
      </div>

      <CardContent className="space-y-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl bg-coral/[0.08] p-5 ring-1 ring-coral/15">
            <Sparkles aria-hidden="true" className="size-5 text-coral" />
            <h3 className="mt-3 text-sm font-black text-ink">Your dog's point of view</h3>
            <p className="mt-1 text-4xl font-black tracking-tight text-coral"><AnimatedNumber value={modelA} /> <span className="text-base">human yrs</span></p>
            <p className="mt-2 text-sm leading-5 text-ink/60">Approximate developmental age using a staged, size-aware convention.</p>
          </article>
          <article className="rounded-3xl bg-teal/[0.08] p-5 ring-1 ring-teal/15">
            <HeartPulse aria-hidden="true" className="size-5 text-teal" />
            <h3 className="mt-3 text-sm font-black text-ink">Our point of view</h3>
            <p className="mt-1 text-4xl font-black tracking-tight text-teal"><AnimatedNumber value={modelC} /> <span className="text-base">human yrs</span></p>
            <p className="mt-2 text-sm leading-5 text-ink/60">Approximate comparison of life lived against the breed's average lifespan.</p>
          </article>
        </div>

        <section aria-label="Life progress">
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-ink">Life progress</h3>
              <p className="text-xs text-ink/55">Compared with a {breed.lifespan}-year breed average</p>
            </div>
            <strong className="text-lg text-teal">{progress.percentage.toFixed(1)}%</strong>
          </div>
          <Progress value={progress.visualPercentage} aria-label={`${progress.percentage.toFixed(1)} percent of average breed lifespan`} />
          {beyond && <p className="mt-3 rounded-2xl bg-sun/25 px-4 py-3 text-sm font-bold text-ink">Beyond the breed's average lifespan — what a remarkable old dog! 🎉</p>}
        </section>
      </CardContent>
    </Card>
  )
}
