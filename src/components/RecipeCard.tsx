import Image from 'next/image'
import type { Recipe } from '@/payload-types'
import { categoryName, recipePhoto } from '@/lib/queries'
import { OfflineLink } from './OfflineLink'

export function RecipeCard({ recipe, showCategory = false }: { recipe: Recipe; showCategory?: boolean }) {
  const photo = recipePhoto(recipe, 'card')
  const initial = recipe.title.trim().charAt(0).toUpperCase()

  return (
    <OfflineLink
      href={`/receta/${recipe.slug}`}
      className="group block overflow-hidden rounded-[18px] border border-soft-2 bg-white transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(45,55,48,0.12)]"
      unavailableClassName="block overflow-hidden rounded-[18px] border border-soft-2 bg-white opacity-50"
    >
      <div className="relative aspect-[4/3] bg-[#eceee8]">
        {photo ? (
          <Image src={photo} alt={recipe.title} fill sizes="(max-width: 760px) 50vw, 25vw" className="object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
            <span className="font-heading text-4xl font-bold text-[#b6bab0]">{initial}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#a4a79d]">sin foto</span>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 pt-3.5">
        {showCategory && (
          <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-accent">
            {categoryName(recipe.category)}
          </div>
        )}
        <div className="font-heading text-base leading-tight font-semibold">{recipe.title}</div>
      </div>
    </OfflineLink>
  )
}
