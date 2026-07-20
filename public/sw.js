const VERSION = 'v2'
const STATIC_CACHE = `mis-recetas-static-${VERSION}`
const MEDIA_CACHE = `mis-recetas-media-${VERSION}`
const DOC_CACHE = `mis-recetas-doc-${VERSION}`
const RSC_CACHE = `mis-recetas-rsc-${VERSION}`
const KNOWN_CACHES = [STATIC_CACHE, MEDIA_CACHE, DOC_CACHE, RSC_CACHE]
const OFFLINE_URL = '/offline.html'

const PRECACHE_URLS = [OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  const cache = await caches.open(cacheName)
  cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      cache.put(request, response.clone())
      return response
    })
    .catch(() => cached)
  return cached || network
}

// Next.js appends a `_rsc` cache-busting query param to client-side route
// transitions, so the cache key is normalized to the bare pathname — otherwise
// every visit to the same route would pile up as a separate, never-reused entry.
async function networkFirst(request, cacheName, cacheKey, { offlineFallback }) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    cache.put(cacheKey, response.clone())
    return response
  } catch {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
    if (offlineFallback) {
      const staticCache = await caches.open(STATIC_CACHE)
      return staticCache.match(OFFLINE_URL)
    }
    throw new Error('offline and not cached')
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // /_next/image is Next's image-optimization endpoint (?url=...&w=...&q=...) —
  // the query string is what identifies the image, so it must be cached by the
  // full URL like a media file, not collapsed to the bare pathname below.
  const isMedia = url.pathname.startsWith('/api/media/file/') || url.pathname === '/_next/image'
  if (!isMedia && (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api'))) return

  if (isMedia) {
    event.respondWith(staleWhileRevalidate(request, MEDIA_CACHE))
    return
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Full page navigations (hard reload / typed URL) and Next.js client-side
  // route transitions (RSC fetches) share the same pathname but need separate
  // caches: one holds real HTML documents, the other RSC payload fragments.
  const isNavigate = request.mode === 'navigate'
  const cacheKey = url.origin + url.pathname
  event.respondWith(
    networkFirst(request, isNavigate ? DOC_CACHE : RSC_CACHE, cacheKey, { offlineFallback: isNavigate }),
  )
})
