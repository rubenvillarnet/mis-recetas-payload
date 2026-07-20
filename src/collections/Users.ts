import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // El primer usuario se crea mediante el flujo especial de Payload
    // (/admin/create-first-user) cuando la colección está vacía, así que
    // esto no bloquea el arranque inicial. A partir de ahí, solo un
    // familiar ya registrado puede dar de alta a los demás desde el admin.
    create: ({ req: { user } }) => !!user,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
