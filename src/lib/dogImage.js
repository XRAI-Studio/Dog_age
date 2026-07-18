const DOG_CEO_API = 'https://dog.ceo/api'
const ALLOWED_IMAGE_HOSTS = new Set(['images.dog.ceo'])

export function buildDogCeoUrl({ dogceo_breed: breed, dogceo_sub_breed: subBreed }) {
  if (!breed) throw new Error('A validated dog.ceo breed mapping is required.')
  const encodedBreed = encodeURIComponent(breed)
  const path = subBreed ? `${encodedBreed}/${encodeURIComponent(subBreed)}` : encodedBreed
  return `${DOG_CEO_API}/breed/${path}/images/random`
}

export function validateDogImagePayload(payload) {
  if (!payload || payload.status !== 'success' || typeof payload.message !== 'string') return false
  try {
    const url = new URL(payload.message)
    return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export async function fetchDogImage(breed, { signal, timeoutMs = 7000, fetchImpl = fetch } = {}) {
  const timeoutController = new AbortController()
  const abortFromParent = () => timeoutController.abort(signal?.reason)
  signal?.addEventListener('abort', abortFromParent, { once: true })
  const timeout = setTimeout(() => timeoutController.abort(new DOMException('Image request timed out.', 'TimeoutError')), timeoutMs)

  try {
    const response = await fetchImpl(buildDogCeoUrl(breed), { signal: timeoutController.signal })
    if (response.status !== 200) throw new Error(`dog.ceo returned HTTP ${response.status}.`)
    const payload = await response.json()
    if (!validateDogImagePayload(payload)) throw new Error('dog.ceo returned an invalid image response.')
    return payload.message
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromParent)
  }
}
