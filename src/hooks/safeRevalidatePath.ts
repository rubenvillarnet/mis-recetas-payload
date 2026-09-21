import { revalidatePath } from 'next/cache'

/**
 * `revalidatePath` solo funciona dentro de un request de Next (admin, API,
 * MCP…). Desde un script lanzado con `payload run` no existe ese contexto y
 * lanza "static generation store missing"; como los hooks afterChange y
 * afterDelete corren dentro de la transacción de Payload, esa excepción
 * revertiría la escritura entera. Fuera de Next no hay caché que revalidar,
 * así que basta con ignorar el error.
 */
export const safeRevalidatePath = (...args: Parameters<typeof revalidatePath>) => {
  try {
    revalidatePath(...args)
  } catch {
    // Sin request de Next: nada que revalidar.
  }
}
