import { useEffect, useState } from 'react'

export function AnimatedNumber({ value }) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [display, setDisplay] = useState(reduceMotion ? value : 0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value)
      return undefined
    }
    const start = performance.now()
    let frame
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 650)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduceMotion, value])

  return (
    <>
      <span aria-hidden="true">{display.toFixed(1)}</span>
      <span className="sr-only">{value.toFixed(1)}</span>
    </>
  )
}
