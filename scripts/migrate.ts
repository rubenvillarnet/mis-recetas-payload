import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from '../src/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(dirname, '../migration-data/data')
const IMAGES_DIR = path.resolve(dirname, '../migration-data/images')

const CATEGORY_MAP: Record<string, { name: string; icon: string; order: number }> = {
  primeros: { name: 'Primeros', icon: 'P', order: 1 },
  segundos: { name: 'Segundos', icon: 'S', order: 2 },
  postres: { name: 'Postres', icon: 'P', order: 3 },
  salsas: { name: 'Salsas', icon: 'S', order: 4 },
  blw: { name: 'BLW', icon: 'B', order: 5 },
}

type SourceRecipe = {
  title: string
  ingredients: string[]
  steps: string[]
  image?: string
  footnote?: string
  ingredientsLabel?: string
}

type NormalizedRecipe = SourceRecipe & { categoryKey: string }

// Nota: `payload run` reescribe process.argv y no conserva de forma fiable
// flags con guiones, así que el dry-run se controla por variable de entorno:
// DRY_RUN=true npm run migrate:seed
const isDryRun = process.env.DRY_RUN === 'true'

function mimeTypeFor(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function loadAllRecipes(): NormalizedRecipe[] {
  const all: NormalizedRecipe[] = []
  for (const categoryKey of Object.keys(CATEGORY_MAP)) {
    const filePath = path.join(DATA_DIR, `${categoryKey}.json`)
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SourceRecipe[]
    raw.forEach((recipe) => all.push({ ...recipe, categoryKey }))
  }
  return all
}

async function main() {
  const allRecipes = loadAllRecipes()
  const categoryKeys = Object.keys(CATEGORY_MAP)

  const referencedImages = new Set(allRecipes.map((r) => r.image).filter(Boolean) as string[])
  const availableImages = new Set(fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [])
  const missingImages = [...referencedImages].filter((f) => !availableImages.has(f))

  console.log(`Leídas ${allRecipes.length} recetas de ${categoryKeys.length} categorías (${DATA_DIR}).`)
  console.log(
    `Imágenes referenciadas: ${referencedImages.size} (encontradas: ${referencedImages.size - missingImages.length}, faltantes: ${missingImages.length}).`,
  )
  if (missingImages.length) {
    console.warn(`Imágenes referenciadas pero no encontradas en migration-data/images:\n  - ${missingImages.join('\n  - ')}`)
  }

  const duplicateTitles = Object.entries(
    allRecipes.reduce<Record<string, number>>((acc, r) => {
      acc[r.title] = (acc[r.title] || 0) + 1
      return acc
    }, {}),
  ).filter(([, count]) => count > 1)
  if (duplicateTitles.length) {
    console.warn(
      `Títulos repetidos entre categorías (el slug se desambiguará automáticamente con -2, -3, ...):\n  - ${duplicateTitles
        .map(([t, c]) => `${t} (${c}x)`)
        .join('\n  - ')}`,
    )
  }

  if (isDryRun) {
    console.log('\n--- DRY RUN: no se ha escrito nada ---')
    console.log(`Categorías a asegurar: ${categoryKeys.length}`)
    console.log(`Imágenes a subir (si no existen ya): ${referencedImages.size - missingImages.length}`)
    console.log(`Recetas a crear (si no existen ya): ${allRecipes.length}`)
    return
  }

  const payload = await getPayload({ config })

  // 1. Categorías (idempotente)
  const categoryIdMap: Record<string, number> = {}
  for (const categoryKey of categoryKeys) {
    const { name, icon, order } = CATEGORY_MAP[categoryKey]
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: name } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      categoryIdMap[categoryKey] = existing.docs[0].id
      continue
    }
    const created = await payload.create({ collection: 'categories', data: { name, icon, order } })
    categoryIdMap[categoryKey] = created.id
    console.log(`Categoría creada: ${name}`)
  }

  // 2. Media (solo las imágenes realmente referenciadas, indexadas por nombre de fichero)
  const mediaIdMap: Record<string, number> = {}
  for (const filename of referencedImages) {
    if (missingImages.includes(filename)) continue
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      mediaIdMap[filename] = existing.docs[0].id
      continue
    }
    const filePath = path.join(IMAGES_DIR, filename)
    const data = fs.readFileSync(filePath)
    const alt = path.basename(filename, path.extname(filename)).replace(/[-_]+/g, ' ')
    const created = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: mimeTypeFor(filename), name: filename, size: data.length },
    })
    mediaIdMap[filename] = created.id
    console.log(`Imagen subida: ${filename}`)
  }

  // 3. Recetas (idempotente por título+categoría)
  let createdCount = 0
  let skippedCount = 0
  for (const recipe of allRecipes) {
    const categoryId = categoryIdMap[recipe.categoryKey]
    const existing = await payload.find({
      collection: 'recipes',
      where: {
        and: [{ title: { equals: recipe.title } }, { category: { equals: categoryId } }],
      },
      limit: 1,
    })
    if (existing.totalDocs > 0) {
      skippedCount += 1
      continue
    }

    const imageId = recipe.image && !missingImages.includes(recipe.image) ? mediaIdMap[recipe.image] : undefined

    await payload.create({
      collection: 'recipes',
      data: {
        title: recipe.title,
        category: categoryId,
        ingredientsLabel: recipe.ingredientsLabel || undefined,
        ingredients: recipe.ingredients.map((text) => ({ text })),
        steps: recipe.steps.map((text) => ({ text })),
        image: imageId,
        footnote: recipe.footnote || undefined,
        featured: false,
      },
    })
    createdCount += 1
  }

  console.log(
    `\nMigración completa. Categorías: ${categoryKeys.length}. Imágenes subidas o existentes: ${Object.keys(mediaIdMap).length}. Recetas creadas: ${createdCount}, ya existentes (omitidas): ${skippedCount}.`,
  )
}

// `payload run` mata el proceso en cuanto el módulo termina de evaluarse
// de forma síncrona; sin este `await` de nivel superior seguiría adelante
// antes de que main() llegase siquiera a conectar con la base de datos.
try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
