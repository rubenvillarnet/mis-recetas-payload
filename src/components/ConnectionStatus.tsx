'use client'

import { useEffect, useState } from 'react'

export function ConnectionStatus() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <>
      <div className="h-9" aria-hidden="true" />
      <div className="fixed inset-x-0 top-0 z-30 flex h-9 items-center justify-center bg-accent px-4 text-center text-xs font-bold tracking-wide text-white uppercase">
        Sin conexión — viendo contenido guardado
      </div>
    </>
  )
}
