import type { CollectionConfig } from 'payload'
import { safeRevalidatePath } from '../hooks/safeRevalidatePath'
import { slugField } from '../fields/slugField'

const revalidateCategoryPaths = (slug?: string | null) => {
  if (slug) safeRevalidatePath(`/categoria/${slug}`)
  safeRevalidatePath('/', 'layout')
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
    preview: (doc) => (typeof doc?.slug === 'string' ? `/categoria/${doc.slug}` : null),
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [({ doc }) => revalidateCategoryPaths(doc.slug)],
    afterDelete: [({ doc }) => revalidateCategoryPaths(doc.slug)],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nombre', required: true, unique: true },
    slugField('name'),
    {
      name: 'icon',
      type: 'text',
      label: 'Icono',
      maxLength: 4,
      admin: { description: 'Inicial o emoji para el icono de la tarjeta de categoría, ej. "P"' },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Orden',
      defaultValue: 0,
      admin: { description: 'Orden de aparición en la navegación y en la home (menor primero)' },
    },
  ],
}
