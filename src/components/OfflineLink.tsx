'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export function OfflineLink({
  href,
  className,
  unavailableClassName,
  children,
}: {
  href: string
  className?: string
  unavailableClassName?: string
  children: React.ReactNode
}) {
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (navigator.onLine || !('caches' in window)) {
        if (!cancelled) setUnavailable(false)
        return
      }
      const match = await caches.match(href, { ignoreSearch: true, ignoreVary: true })
      if (!cancelled) setUnavailable(!match)
    }

    check()
    window.addEventListener('online', check)
    window.addEventListener('offline', check)
    return () => {
      cancelled = true
      window.removeEventListener('online', check)
      window.removeEventListener('offline', check)
    }
  }, [href])

  if (unavailable) {
    return (
      <div className={`relative ${unavailableClassName ?? className ?? ''}`} aria-disabled="true" title="No disponible sin conexión">
        {children}
        <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Sin conexión
        </span>
      </div>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
