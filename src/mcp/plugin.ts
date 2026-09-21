import { mcpPlugin } from '@payloadcms/plugin-mcp'

import { searchRecipesTool, uploadRecipePhotoTool } from './tools'

/**
 * Servidor MCP en POST /api/mcp para que un agente de IA consulte y dé de
 * alta recetas. La autenticación y los permisos finos se gestionan desde el
 * admin (grupo MCP → API Keys): cada clave va ligada a un usuario y tiene un
 * checkbox por operación y por tool. Aquí solo se fija el máximo que una
 * clave puede llegar a permitir (p. ej. borrar recetas queda fuera).
 */
export const recipesMcp = mcpPlugin({
  collections: {
    recipes: {
      enabled: { find: true, create: true, update: true, delete: false },
      description:
        'Recetas del recetario familiar. Campos: title, category (id numérico de una categoría existente, obtenlo con findCategories), ingredientsLabel (nota de raciones, opcional), ingredients (array de {text}), steps (array de {text}), image (id de media, opcional; súbela con uploadRecipePhoto), footnote (nota de la cocina, opcional), featured (destacada en la home). El slug se genera solo a partir del título.',
    },
    categories: {
      enabled: { find: true },
      description:
        'Categorías del recetario (name, slug, icon, order). Se usan por id en el campo category de las recetas.',
    },
    media: {
      enabled: { find: true },
      description:
        'Fotos de las recetas ya subidas (alt, filename, url, sizes). Para subir una nueva usa uploadRecipePhoto.',
    },
  },
  mcp: {
    serverOptions: {
      serverInfo: { name: 'En mi casa se cocina así', version: '1.0.0' },
      instructions: [
        'Recetario familiar en español. Escribe títulos, ingredientes y pasos en castellano, en el tono de una receta de casa.',
        'Para consultar: searchRecipes busca por título o ingrediente; findRecipes acepta where en JSON con la sintaxis de Payload (p. ej. {"featured":{"equals":true}} o {"title":{"like":"lentejas"}}) y con id devuelve la receta completa.',
        'Para crear una receta: 1) findCategories para obtener el id de la categoría; 2) si hay foto, uploadRecipePhoto con su URL para obtener el id de media; 3) createRecipes con title, category, ingredients [{text}], steps [{text}] y, opcionalmente, image, ingredientsLabel, footnote y featured.',
        'No envíes slug: se genera automáticamente y se garantiza único. Antes de crear, comprueba con searchRecipes que la receta no exista ya.',
      ].join('\n'),
    },
    tools: [searchRecipesTool, uploadRecipePhotoTool],
  },
})
