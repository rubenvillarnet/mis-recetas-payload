import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slugField'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'Categoría',
    plural: 'Categorías',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order'],
  },
  access: {
    read: () => true,
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
