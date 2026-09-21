import type { Where } from 'payload'

/**
 * Cláusula de búsqueda por título o ingrediente. Compartida entre el buscador
 * del frontend (queries.ts) y la tool `searchRecipes` del servidor MCP para
 * que ambos devuelvan lo mismo. Vive en su propio módulo porque el plugin MCP
 * se importa desde payload.config.ts y no puede tirar de queries.ts (que a su
 * vez importa la config).
 */
export function recipeSearchWhere(query: string): Where {
  return { or: [{ title: { like: query } }, { 'ingredients.text': { like: query } }] }
}
