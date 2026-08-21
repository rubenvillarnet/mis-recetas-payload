import type { Category, Media, Recipe } from '@/payload-types'

/**
 * Funciones puras sobre datos ya cargados de Recipe/Category. A diferencia de
 * queries.ts, este módulo no importa el cliente de Payload, así que también
 * lo pueden usar componentes cliente (p. ej. RecipeCard) sin arrastrar
 * `payload.config.ts` (y con él, sharp) al bundle del navegador.
 */

function mediaUrl(image: Recipe['image'], size?: 'thumbnail' | 'card' | 'hero'): string | null {
  if (!image || typeof image !== 'object') return null
  const media = image as Media
  if (size && media.sizes?.[size]?.url) return media.sizes[size]!.url as string
  return media.url ?? null
}

export function recipePhoto(recipe: Pick<Recipe, 'image'>, size: 'card' | 'hero' = 'card') {
  return mediaUrl(recipe.image, size)
}

export function categoryName(category: Recipe['category']): string {
  if (category && typeof category === 'object') return (category as Category).name
  return ''
}

export function categorySlug(category: Recipe['category']): string {
  if (category && typeof category === 'object') return (category as Category).slug || ''
  return ''
}

export type RecipeOgImage = { url: string; width?: number; height?: number; alt: string }

export function recipeOgImage(recipe: Pick<Recipe, 'image' | 'title'>): RecipeOgImage | null {
  if (!recipe.image || typeof recipe.image !== 'object') return null
  const media = recipe.image as Media
  const hero = media.sizes?.hero
  const url = hero?.url ?? media.url
  if (!url) return null
  return {
    url,
    width: hero?.width ?? media.width ?? undefined,
    height: hero?.height ?? media.height ?? undefined,
    alt: media.alt || recipe.title,
  }
}

export function recipeSummary(recipe: Pick<Recipe, 'ingredients' | 'ingredientsLabel'>, max = 180): string {
  const items = (recipe.ingredients ?? [])
    .map((ingredient) => ingredient.text?.trim())
    .filter((text): text is string => Boolean(text))
  const label = recipe.ingredientsLabel?.trim()
  const parts: string[] = []
  if (label) parts.push(label.replace(/[.\s]+$/, '') + '.')
  if (items.length) parts.push(`Ingredientes: ${items.join(', ')}.`)
  const summary = parts.join(' ')
  if (summary.length <= max) return summary
  return summary.slice(0, summary.lastIndexOf(' ', max - 1)).replace(/[,.\s]+$/, '') + '…'
}
