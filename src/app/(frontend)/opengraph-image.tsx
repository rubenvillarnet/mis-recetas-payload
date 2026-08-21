import { ImageResponse } from 'next/og'
import { OgCard } from '@/components/OgCard'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'En mi casa se cocina así'

export default function OpengraphImage() {
  return new ImageResponse(
    <OgCard title="En mi casa se cocina así" subtitle="Nuestro cuaderno de recetas de familia" />,
    { ...size },
  )
}
