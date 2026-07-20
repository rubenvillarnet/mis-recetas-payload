import type { Field } from 'payload'
import { generateUniqueSlug } from '../hooks/generateUniqueSlug'

export const slugField = (sourceField: string): Field => ({
  name: 'slug',
  type: 'text',
  label: 'URL',
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: `Se genera automáticamente a partir de "${sourceField}". Puedes editarlo a mano si lo necesitas.`,
  },
  hooks: {
    beforeValidate: [generateUniqueSlug(sourceField)],
  },
})
