import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'En mi casa se cocina así',
    short_name: 'Mis recetas',
    description: 'Nuestro cuaderno de recetas de familia. Las de siempre, las que salen bien y las que apetece repetir.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f5f1',
    theme_color: '#3f5d7a',
    lang: 'es',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
