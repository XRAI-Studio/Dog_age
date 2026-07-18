import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '../lib/utils'

export function BreedCombobox({ breeds, value, onChange, error }) {
  const id = useId()
  const inputRef = useRef(null)
  const keepQueryOnNull = useRef(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value?.name ?? '')
  const [activeIndex, setActiveIndex] = useState(-1)
  const listboxId = `${id}-listbox`
  const errorId = `${id}-error`
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle || query === value?.name) return breeds
    return breeds.filter((breed) => breed.name.toLocaleLowerCase().includes(needle))
  }, [breeds, query, value])

  useEffect(() => {
    if (value) {
      setQuery(value.name)
    } else if (keepQueryOnNull.current) {
      keepQueryOnNull.current = false
    } else {
      setQuery('')
    }
  }, [value])

  const select = (breed) => {
    if (!breed) return
    onChange(breed)
    setQuery(breed.name)
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => index <= 0 ? filtered.length - 1 : index - 1)
    } else if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(filtered.length - 1)
    } else if (event.key === 'Enter' && open) {
      event.preventDefault()
      select(filtered[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative">
      <label htmlFor={`${id}-input`} className="mb-2 block text-sm font-bold text-ink">Dog breed</label>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-teal" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          value={query}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
            if (value && event.target.value !== value.name) {
              keepQueryOnNull.current = true
              onChange(null)
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Start typing a breed…"
          className="h-12 w-full rounded-2xl border-2 border-ink/15 bg-cream/45 py-2 pl-12 pr-11 text-base text-ink outline-none transition placeholder:text-ink/40 focus:border-teal focus:ring-4 focus:ring-teal/10"
        />
        <ChevronsUpDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-ink/45" />
      </div>
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Dog breeds"
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-ink/10 bg-white p-2 shadow-xl"
        >
          {filtered.length ? filtered.map((breed, index) => (
            <li
              id={`${id}-option-${index}`}
              key={breed.name}
              role="option"
              aria-selected={value?.name === breed.name}
              className={cn('flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-ink', activeIndex === index && 'bg-teal/10 text-teal')}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(breed)}
            >
              {breed.name}
              {value?.name === breed.name && <Check aria-hidden="true" className="size-4" />}
            </li>
          )) : <li className="px-3 py-4 text-sm text-ink/60">No breeds found. Try another spelling.</li>}
        </ul>
      )}
      {error && <p id={errorId} className="mt-2 text-sm font-semibold text-[#b43f35]">{error}</p>}
    </div>
  )
}
