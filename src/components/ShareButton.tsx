'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'copied' | 'error'

function legacyCopy(url: string) {
  const field = document.createElement('textarea')
  field.value = url
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(field)
  }
}

export function ShareButton({ title, text }: { title: string; text?: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const flash = (next: Status) => {
    setStatus(next)
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setStatus('idle'), 2400)
  }

  const share = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // El usuario canceló o el navegador rechazó el diálogo: seguimos con el copiado.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      flash('copied')
      return
    } catch {
      // Sin permiso de portapapeles: probamos la vía antigua.
    }

    flash(legacyCopy(url) ? 'copied' : 'error')
  }

  const label = status === 'copied' ? 'Enlace copiado' : status === 'error' ? 'No se pudo copiar' : 'Compartir'

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`Compartir ${title}`}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-soft bg-white py-2 pr-3.5 pl-3 text-[13px] font-bold text-[#4c4e47] shadow-[0_4px_14px_rgba(45,55,48,0.06)] transition-colors hover:border-accent hover:text-accent"
    >
      {status === 'copied' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : status === 'error' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 7v6M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      )}
      <span aria-live="polite">{label}</span>
    </button>
  )
}
