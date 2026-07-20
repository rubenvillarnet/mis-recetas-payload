import { SearchBox } from '@/components/SearchBox'
import { CategoryCard } from '@/components/CategoryCard'
import { RecipeGrid } from '@/components/RecipeGrid'
import { getCategoriesWithCounts, getFeaturedRecipes } from '@/lib/queries'

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategoriesWithCounts(), getFeaturedRecipes()])

  return (
    <section className="animate-fade-up">
      <div className="px-0 py-16 pb-10 text-center">
        <div className="mb-4 text-xs font-extrabold tracking-widest text-accent uppercase">
          Recopiladas con los años
        </div>
        <h1 className="font-heading mx-auto max-w-[14ch] text-[38px] leading-tight font-bold text-balance nav:text-[52px]">
          En mi casa se cocina así
        </h1>
        <p className="mx-auto mt-4.5 max-w-[46ch] text-lg leading-relaxed text-muted-2">
          Nuestro cuaderno de recetas de familia. Las de siempre, las que salen bien y las que apetece repetir.
        </p>
        <div className="mt-[30px]">
          <SearchBox />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 nav:grid-cols-5">
        {categories.map((category, i) => (
          <CategoryCard key={category.id} category={category} index={i} />
        ))}
      </div>

      {featured.length > 0 && (
        <>
          <div className="mt-13 mb-5 flex items-baseline justify-between">
            <h2 className="font-heading m-0 text-2xl font-bold">Para hoy mismo</h2>
            <span className="text-sm font-semibold text-muted">Una pequeña selección</span>
          </div>
          <RecipeGrid recipes={featured} showCategory />
        </>
      )}
    </section>
  )
}
