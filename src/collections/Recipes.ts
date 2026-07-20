import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slugField'

export const Recipes: CollectionConfig = {
  slug: 'recipes',
  labels: {
    singular: 'Receta',
    plural: 'Recetas',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'featured'],
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Título', required: true },
    slugField('title'),
    {
      name: 'category',
      type: 'relationship',
      label: 'Categoría',
      relationTo: 'categories',
      hasMany: false,
      required: true,
    },
    {
      name: 'ingredientsLabel',
      type: 'text',
      label: 'Nota de raciones',
      admin: { description: 'Texto libre, ej. "Para 5 raciones" (opcional)' },
    },
    {
      name: 'ingredients',
      type: 'array',
      label: 'Ingredientes',
      required: true,
      minRows: 1,
      labels: { singular: 'Ingrediente', plural: 'Ingredientes' },
      fields: [{ name: 'text', type: 'text', label: 'Texto', required: true }],
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Pasos',
      required: true,
      minRows: 1,
      labels: { singular: 'Paso', plural: 'Pasos' },
      fields: [{ name: 'text', type: 'textarea', label: 'Texto', required: true }],
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Foto',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'footnote',
      type: 'textarea',
      label: 'Nota de la cocina',
      admin: { description: 'Nota de la cocina: consejo, variante o advertencia (opcional)' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacada',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Aparece en la sección "Para hoy mismo" de la home',
      },
    },
  ],
}
