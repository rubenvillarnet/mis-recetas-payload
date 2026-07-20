import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Breadcrumb } from '@/components/Breadcrumb'
import { IngredientsSidebar } from '@/components/IngredientsSidebar'
import { StepsList } from '@/components/StepsList'
import { FootnoteBox } from '@/components/FootnoteBox'
import { getRecipeBySlug, categoryName, categorySlug, recipePhoto } from '@/lib/queries'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

export async function generateStaticParams() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'recipes', limit: 1000, depth: 0 })
  return docs.map((recipe) => ({ slug: recipe.slug || '' })).filter((p) => p.slug)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) return {}
  return { title: `${recipe.title} — En mi casa se cocina así` }
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  const catName = categoryName(recipe.category)
  const catSlug = categorySlug(recipe.category)
  const photo = recipePhoto(recipe, 'hero')

  return (
    <section className="animate-fade-up mx-auto max-w-[860px] pt-8.5">
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: catName, href: `/categoria/${catSlug}` },
          { label: recipe.title },
        ]}
      />

      <div className="mb-2.5 text-xs font-extrabold tracking-wider text-accent uppercase">{catName}</div>
      <h1 className="font-heading mb-6 text-[32px] leading-tight font-bold text-balance nav:text-[44px]">
        {recipe.title}
      </h1>

      {photo && (
        <div className="relative mb-9 aspect-video overflow-hidden rounded-[20px] shadow-[0_16px_34px_rgba(45,55,48,0.14)]">
          <Image src={photo} alt={recipe.title} fill sizes="(max-width: 860px) 100vw, 860px" className="object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6.5 nav:grid-cols-[300px_1fr] nav:gap-11">
        <IngredientsSidebar ingredients={recipe.ingredients} label={recipe.ingredientsLabel} />

        <div>
          <StepsList steps={recipe.steps} />
          {recipe.footnote && <FootnoteBox text={recipe.footnote} />}
        </div>
      </div>

      <div className="mt-12 border-t border-soft pt-6">
        <Link href={`/categoria/${catSlug}`} className="text-[15px] font-bold text-text hover:text-accent">
          ‹ Volver a {catName}
        </Link>
      </div>
    </section>
  )
}
