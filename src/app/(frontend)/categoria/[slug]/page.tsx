import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { RecipeGrid } from '@/components/RecipeGrid'
import { getAllCategories, getCategoryBySlug, getRecipesByCategory } from '@/lib/queries'

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getAllCategories()
  return categories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return { title: `${category.name} — En mi casa se cocina así` }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const recipes = await getRecipesByCategory(category.id)

  return (
    <section className="animate-fade-up pt-8.5">
      <Breadcrumb items={[{ label: 'Inicio', href: '/' }, { label: category.name }]} />
      <div className="mb-6.5 flex items-end justify-between gap-5 border-b border-soft pb-5.5">
        <h1 className="font-heading m-0 text-4xl font-bold">{category.name}</h1>
        <span className="pb-1.5 text-[15px] font-bold whitespace-nowrap text-muted">
          {recipes.length} recetas
        </span>
      </div>
      <RecipeGrid recipes={recipes} />
    </section>
  )
}
