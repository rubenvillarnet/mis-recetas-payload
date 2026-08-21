'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { findRecipes, type SearchResult } from '@/lib/search-action'

const DEBOUNCE_MS = 180
const MAX_VISIBLE = 6

type Status = 'idle' | 'loading' | 'done' | 'error'

export function SearchBox({
  defaultValue = '',
  autoFocus = false,
}: {
  defaultValue?: string
  autoFocus?: boolean
}) {
  const router = useRouter()
  const listId = useId()
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Cada búsqueda lleva su número: si vuelve una respuesta de una petición
  // anterior a la última que lanzamos, se descarta.
  const lastRequest = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState(defaultValue)
  const [typed, setTyped] = useState(false)
  const [closed, setClosed] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [active, setActive] = useState(-1)

  const term = query.trim()
  const open = typed && !closed && term.length > 0
  const visible = results.slice(0, MAX_VISIBLE)
  const hidden = results.length - visible.length

  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  const search = (value: string) => {
    clearTimeout(timer.current ?? undefined)
    const id = ++lastRequest.current

    if (!value) {
      setResults([])
      setStatus('idle')
      return
    }

    setStatus('loading')
    timer.current = setTimeout(async () => {
      try {
        const found = await findRecipes(value)
        if (lastRequest.current !== id) return
        setResults(found)
        setStatus('done')
      } catch {
        if (lastRequest.current !== id) return
        setResults([])
        setStatus('error')
      }
    }, DEBOUNCE_MS)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setClosed(true)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (active < 0) return
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  const openRecipe = (result: SearchResult) => {
    setClosed(true)
    router.push(`/receta/${result.slug}`)
  }

  const handleChange = (value: string) => {
    setQuery(value)
    setTyped(true)
    setClosed(false)
    setActive(-1)
    search(value.trim())
  }

  const clear = () => {
    handleChange('')
    inputRef.current?.focus()
  }

  // Sin JavaScript el formulario cae en /buscar; con él, Enter abre la receta
  // marcada (o la primera) y nunca se sale de la página.
  const openChosen = () => {
    const chosen = visible[active] ?? visible[0]
    if (chosen) openRecipe(chosen)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setClosed(true)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      openChosen()
      return
    }
    if (!visible.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setClosed(false)
      setActive((i) => (i + 1) % visible.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setClosed(false)
      setActive((i) => (i <= 0 ? visible.length - 1 : i - 1))
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    openChosen()
  }

  return (
    <div ref={boxRef} className="relative mx-auto max-w-[520px]">
      <form action="/buscar" method="GET" onSubmit={handleSubmit} role="search" className="relative">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9a9b91"
          strokeWidth="2"
          strokeLinecap="round"
          className="pointer-events-none absolute top-1/2 left-5 z-10 -translate-y-1/2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.2-3.2" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={query}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setClosed(false)}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Busca una receta…"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="w-full rounded-2xl border border-soft bg-white py-[17px] pr-12 pl-[52px] text-base text-text shadow-[0_6px_20px_rgba(45,55,48,0.06)] outline-none"
        />
        {term && (
          <button
            type="button"
            onClick={clear}
            aria-label="Borrar búsqueda"
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1.5 text-muted transition-colors hover:text-text"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </form>

      {open && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-soft bg-white text-left shadow-[0_16px_30px_rgba(45,55,48,0.14)]">
          {visible.length > 0 ? (
            <>
              <ul id={listId} role="listbox" className="m-0 max-h-[min(60vh,420px)] list-none overflow-y-auto p-1.5">
                {visible.map((result, index) => (
                  <li key={result.id} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
                    <Link
                      href={`/receta/${result.slug}`}
                      onClick={() => setClosed(true)}
                      onMouseEnter={() => setActive(index)}
                      className={`flex items-center gap-3 rounded-[13px] p-2 transition-colors ${
                        index === active ? 'bg-[#eef1f4]' : ''
                      }`}
                    >
                      <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] bg-[#eceee8]">
                        {result.photo ? (
                          <Image src={result.photo} alt="" fill sizes="52px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="font-heading text-base font-bold text-[#b6bab0]">
                              {result.title.trim().charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        {result.category && (
                          <div className="mb-0.5 text-[11px] font-extrabold tracking-wider text-accent uppercase">
                            {result.category}
                          </div>
                        )}
                        <div className="font-heading truncate text-[15px] leading-tight font-semibold text-text">
                          {result.title}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {hidden > 0 && (
                <Link
                  href={`/buscar?q=${encodeURIComponent(term)}`}
                  onClick={() => setClosed(true)}
                  className="block border-t border-soft px-4 py-3 text-center text-sm font-bold text-accent"
                >
                  Ver las {results.length} recetas
                </Link>
              )}
            </>
          ) : (
            <p className="m-0 px-4 py-5 text-center text-sm font-semibold text-muted">
              {status === 'loading'
                ? 'Buscando…'
                : status === 'error'
                  ? 'No se pudo buscar. Comprueba tu conexión.'
                  : 'No hay recetas que coincidan'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
