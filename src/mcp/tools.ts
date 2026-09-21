import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { recipeSearchWhere } from '@/lib/recipe-search'
import { categoryName, recipePhoto } from '@/lib/recipe-presenters'

type MCPTool = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>[number]

const MAX_PHOTO_BYTES = 15 * 1024 * 1024

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })

const errorText = (prefix: string, error: unknown) =>
  text(`❌ ${prefix}: ${error instanceof Error ? error.message : String(error)}`)

const publicUrl = (path: string | null) =>
  path && path.startsWith('/') ? `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${path}` : path

/**
 * Búsqueda por título o ingrediente, la misma que usa /buscar. Devuelve un
 * resumen por receta en lugar del documento entero: para leer una receta
 * completa el agente usa `findRecipes` con el id.
 */
export const searchRecipesTool: MCPTool = {
  name: 'searchRecipes',
  description:
    'Busca recetas por texto en el título o en los ingredientes (búsqueda parcial, sin distinguir mayúsculas). Devuelve id, título, slug, categoría, foto y URL pública de cada receta. Para ver ingredientes y pasos completos usa findRecipes con el id.',
  parameters: {
    q: z.string().min(1).describe('Texto a buscar, p. ej. "lentejas" o "bacalao"'),
  },
  handler: async (args, req: PayloadRequest) => {
    const q = String(args.q ?? '').trim()
    if (!q) return text('Indica un texto a buscar.')
    try {
      const result = await req.payload.find({
        collection: 'recipes',
        where: recipeSearchWhere(q),
        depth: 1,
        limit: 50,
        sort: 'title',
      })
      if (result.totalDocs === 0) return text(`No hay recetas que coincidan con "${q}".`)
      const rows = result.docs.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        category: categoryName(recipe.category),
        featured: recipe.featured ?? false,
        photo: publicUrl(recipePhoto(recipe, 'card')),
        url: recipe.slug ? publicUrl(`/receta/${recipe.slug}`) : null,
      }))
      return text(
        `${result.totalDocs} receta(s) para "${q}"${result.totalDocs > rows.length ? ` (mostrando ${rows.length})` : ''}:\n\`\`\`json\n${JSON.stringify(rows, null, 2)}\n\`\`\``,
      )
    } catch (error) {
      return errorText('Error buscando recetas', error)
    }
  },
}

const fileNameFromUrl = (url: URL, mimetype: string) => {
  const last = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? '')
  if (/\.[a-z0-9]{3,4}$/i.test(last)) return last
  const ext = mimetype.split('/')[1]?.split(';')[0] || 'jpg'
  return `foto-${Date.now()}.${ext === 'jpeg' ? 'jpg' : ext}`
}

/**
 * La tool genérica `createMedia` del plugin no puede recibir binarios, así que
 * las fotos entran por URL: se descarga, se crea el Media (sube a R2 y genera
 * los tamaños) y opcionalmente se enlaza a una receta. Se ejecuta con el
 * `overrideAccess` por defecto del Local API porque el plugin ya ha validado
 * la API key y el checkbox de la tool en esa clave decide si está permitida
 * (`req.user` no viene poblado dentro de las tools personalizadas).
 */
export const uploadRecipePhotoTool: MCPTool = {
  name: 'uploadRecipePhoto',
  description:
    'Descarga una imagen desde una URL pública y la guarda como foto (colección media). Devuelve el id del media para usarlo en el campo image de createRecipes/updateRecipes. Si indicas recipeId, la asigna directamente a esa receta.',
  parameters: {
    url: z.string().url().describe('URL pública http(s) de la imagen (jpg, png, webp...)'),
    alt: z.string().min(1).describe('Texto alternativo descriptivo, normalmente el nombre del plato'),
    recipeId: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Opcional: id de la receta a la que asignar la foto'),
  },
  handler: async (args, req: PayloadRequest) => {
    const alt = String(args.alt ?? '').trim()
    const recipeId = typeof args.recipeId === 'number' ? args.recipeId : undefined

    let url: URL
    try {
      url = new URL(String(args.url))
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('solo http(s)')
    } catch (error) {
      return errorText('URL no válida', error)
    }

    try {
      const response = await fetch(url, { redirect: 'follow' })
      if (!response.ok) throw new Error(`la descarga devolvió HTTP ${response.status}`)

      const mimetype = (response.headers.get('content-type') || '').split(';')[0].trim()
      if (!mimetype.startsWith('image/')) {
        throw new Error(`la URL no es una imagen (content-type: ${mimetype || 'desconocido'})`)
      }
      const declared = Number(response.headers.get('content-length') || 0)
      if (declared > MAX_PHOTO_BYTES) throw new Error('la imagen supera los 15 MB')

      const data = Buffer.from(await response.arrayBuffer())
      if (data.length > MAX_PHOTO_BYTES) throw new Error('la imagen supera los 15 MB')

      const media = await req.payload.create({
        collection: 'media',
        data: { alt },
        file: { data, mimetype, name: fileNameFromUrl(url, mimetype), size: data.length },
      })

      let assigned = ''
      if (recipeId) {
        const recipe = await req.payload.update({
          collection: 'recipes',
          id: recipeId,
          data: { image: media.id },
          depth: 0,
        })
        assigned = `\nAsignada a la receta ${recipe.id} ("${recipe.title}").`
      }

      return text(
        `Foto subida correctamente.${assigned}\n\`\`\`json\n${JSON.stringify(
          { id: media.id, filename: media.filename, url: media.url, alt: media.alt },
          null,
          2,
        )}\n\`\`\`\nUsa "image": ${media.id} en createRecipes o updateRecipes.`,
      )
    } catch (error) {
      return errorText('No se pudo subir la foto', error)
    }
  },
}
