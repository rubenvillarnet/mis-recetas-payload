import { getPayloadClient } from './payload'
import { recipeSearchWhere } from './recipe-search'
import type { Category, Recipe } from '@/payload-types'

export {
  recipePhoto,
  categoryName,
  categorySlug,
  recipeOgImage,
  recipeSummary,
  type RecipeOgImage,
} from './recipe-presenters'

export type CategoryWithCount = Category & { recipeCount: number }

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

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: { featured: { equals: true } },
    sort: 'title',
    depth: 1,
    limit: 500,
  })
  return result.docs
}

export async function searchRecipes(q: string): Promise<Recipe[]> {
  const query = q?.trim()
  if (!query) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'recipes',
    where: recipeSearchWhere(query),
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
