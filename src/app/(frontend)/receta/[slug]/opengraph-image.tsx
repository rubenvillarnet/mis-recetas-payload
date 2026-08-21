import { ImageResponse } from 'next/og'
import { OgCard } from '@/components/OgCard'
import { getRecipeBySlug } from '@/lib/queries'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'En mi casa se cocina así'

/**
 * Respaldo para las recetas sin foto: las que sí la tienen la declaran en
 * `generateMetadata`, y esa imagen tiene prioridad sobre este archivo.
 */
export default async function RecipeOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)

  return new ImageResponse(
    <OgCard title={recipe?.title ?? 'En mi casa se cocina así'} subtitle="En mi casa se cocina así" />,
    { ...size },
  )
}
