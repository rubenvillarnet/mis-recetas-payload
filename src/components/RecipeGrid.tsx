import type { Recipe } from '@/payload-types'
import { RecipeCard } from './RecipeCard'

export function RecipeGrid({ recipes, showCategory = false }: { recipes: Recipe[]; showCategory?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 nav:gap-[18px] nav:grid-cols-3 grid:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} showCategory={showCategory} />
      ))}
    </div>
  )
}
