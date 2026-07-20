import { SearchBox } from '@/components/SearchBox'
import { RecipeGrid } from '@/components/RecipeGrid'
import { searchRecipes } from '@/lib/queries'

export const metadata = {
  title: 'Buscar receta — En mi casa se cocina así',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const results = q.trim() ? await searchRecipes(q) : []

  const label = !q.trim()
    ? 'Escribe algo para buscar'
    : results.length === 0
      ? 'No hay recetas que coincidan con tu búsqueda'
      : results.length === 1
        ? '1 receta encontrada'
        : `${results.length} recetas encontradas`

  return (
    <section className="animate-fade-up pt-8.5">
      <div className="mb-7.5">
        <SearchBox defaultValue={q} autoFocus />
      </div>
      <p className="mb-6.5 text-center font-semibold text-muted">{label}</p>
      <RecipeGrid recipes={results} showCategory />
    </section>
  )
}
