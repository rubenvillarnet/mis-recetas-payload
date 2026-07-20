import type { FieldHook } from 'payload'
import slugify from 'slugify'

export const generateUniqueSlug = (sourceField: string): FieldHook => {
  return async ({ value, originalDoc, data, req, collection }) => {
    const base = slugify(String(value || data?.[sourceField] || originalDoc?.[sourceField] || ''), {
      lower: true,
      strict: true,
    })
    if (!base || !collection) return value

    let candidate = base
    let suffix = 2

    while (
      await req.payload
        .find({
          collection: collection.slug,
          where: {
            and: [
              { slug: { equals: candidate } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
        })
        .then((result) => result.totalDocs > 0)
    ) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }

    return candidate
  }
}
