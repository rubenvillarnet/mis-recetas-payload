'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export function ConnectionStatus() {
  // En el servidor no hay forma de saber si hay red, así que se pinta como
  // conectado y el navegador corrige al hidratar.
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  )

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
