'use client'

import { useSyncExternalStore } from 'react'
import type { Recipe } from '@/payload-types'
import { RecipeCard } from './RecipeCard'

type View = 'grid' | 'list'

const STORAGE_KEY = 'recetario:vista'
// `storage` solo avisa a las *otras* pestañas, así que la propia se entera por
// este evento; de paso, las demás pestañas se ponen al día solas.
const VIEW_EVENT = 'recetario:vista-cambiada'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(VIEW_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(VIEW_EVENT, onChange)
  }
}

function readView(): View {
  return localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid'
}

function ViewButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-accent text-white' : 'text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

export function CategoryRecipes({ recipes }: { recipes: Recipe[] }) {
  const view = useSyncExternalStore(subscribe, readView, (): View => 'grid')

  const changeView = (next: View) => {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new Event(VIEW_EVENT))
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div
          role="group"
          aria-label="Tipo de vista"
          className="inline-flex gap-0.5 rounded-full border border-soft bg-white p-1 shadow-[0_4px_14px_rgba(45,55,48,0.06)]"
        >
          <ViewButton active={view === 'grid'} label="Vista de cuadrícula" onClick={() => changeView('grid')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
          </ViewButton>
          <ViewButton active={view === 'list'} label="Vista de lista" onClick={() => changeView('list')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ViewButton>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-3.5 nav:grid-cols-3 nav:gap-[18px] grid:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} layout="list" />
          ))}
        </div>
      )}
    </div>
  )
}
