import { getPayloadClient } from './payload'
import type { Category, Media, Recipe } from '@/payload-types'

export type CategoryWithCount = Category & { recipeCount: number }

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

export async function getAllCategories(): Promise<Category[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    sort: 'order',
    limit: 100,
  })
  return result.docs
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const payload = await getPayloadClient()
  const categories = await getAllCategories()
  const counts = await Promise.all(
    categories.map((category) =>
      payload.count({
        collection: 'recipes',
        where: { category: { equals: category.id } },
      }),
    ),
  )
  return categories.map((category, i) => ({ ...category, recipeCount: counts[i].totalDocs }))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function getRecipesByCategory(categoryId: number): Promise<Recipe[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: { category: { equals: categoryId } },
    sort: 'title',
    depth: 1,
    limit: 500,
  })
  return result.docs
}

export async function getFeaturedRecipes(limit = 4): Promise<Recipe[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: { featured: { equals: true } },
    depth: 1,
    limit,
  })
  return result.docs
}

export async function searchRecipes(q: string): Promise<Recipe[]> {
  const query = q?.trim()
  if (!query) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: {
      or: [{ title: { like: query } }, { 'ingredients.text': { like: query } }],
    },
    depth: 1,
    limit: 100,
    sort: 'title',
  })
  return result.docs
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return result.docs[0] ?? null
}
