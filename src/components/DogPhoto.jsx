import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageOff, RefreshCw } from 'lucide-react'
import { fetchDogImage } from '../lib/dogImage'
import { Button } from './ui/button'

const FALLBACK_IMAGE = `${import.meta.env.BASE_URL}generic-dog.svg`

export function DogPhoto({ breed }) {
  const requestId = useRef(0)
  const controller = useRef(null)
  const [src, setSrc] = useState(FALLBACK_IMAGE)
  const [isFallback, setIsFallback] = useState(true)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    controller.current?.abort()
    const currentController = new AbortController()
    controller.current = currentController
    const currentRequest = ++requestId.current
    setSrc(FALLBACK_IMAGE)
    setIsFallback(true)

    if (breed.image_is_substitute) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const imageUrl = await fetchDogImage(breed, { signal: currentController.signal })
      if (currentRequest !== requestId.current) return
      setSrc(imageUrl)
      setIsFallback(false)
    } catch {
      if (currentRequest !== requestId.current) return
      setSrc(FALLBACK_IMAGE)
      setIsFallback(true)
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [breed])

  useEffect(() => {
    load()
    return () => controller.current?.abort()
  }, [load])

  const useFallback = () => {
    setSrc(FALLBACK_IMAGE)
    setIsFallback(true)
    setLoading(false)
  }

  const alt = isFallback ? `Generic dog illustration for ${breed.name}` : `${breed.name} dog photo`

  return (
    <div data-testid="dog-photo" aria-busy={loading} className="relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-sun/15">
        <img
          src={src}
          alt={alt}
          onError={useFallback}
          className="h-full w-full object-cover"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/75 text-sm font-bold text-teal backdrop-blur-sm">
            <RefreshCw aria-hidden="true" className="mr-2 size-5 animate-spin motion-reduce:animate-none" />
            Finding a photo…
          </div>
        )}
        {isFallback && !loading && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-ink shadow">
            <ImageOff aria-hidden="true" className="size-3.5" /> Local stand-in
          </div>
        )}
      </div>
      {!breed.image_is_substitute && (
        <Button type="button" variant="ghost" size="sm" disabled={loading} onClick={load} className="mt-2 w-full">
          <RefreshCw aria-hidden="true" className="size-4" /> Fetch another photo
        </Button>
      )}
    </div>
  )
}
