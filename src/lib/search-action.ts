'use server'

import { searchRecipes } from './queries'
import { categoryName, recipePhoto } from './recipe-presenters'

/**
 * Versión ligera de una receta para el desplegable del buscador: solo lo que
 * pinta cada fila, en vez de mandar el documento entero al navegador.
 */
export type SearchResult = {
  id: number
  slug: string
  title: string
  category: string
  photo: string | null
}

export async function findRecipes(q: string): Promise<SearchResult[]> {
  const recipes = await searchRecipes(q)
  return recipes
    .filter((recipe) => Boolean(recipe.slug))
    .map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug as string,
      title: recipe.title,
      category: categoryName(recipe.category),
      photo: recipePhoto(recipe, 'card'),
    }))
}
