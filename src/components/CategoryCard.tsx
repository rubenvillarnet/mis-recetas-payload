import Link from 'next/link'
import type { CategoryWithCount } from '@/lib/queries'

const PALETTE = [
  { bg: '#e7ecf1', fg: '#3f5d7a' },
  { bg: '#e6e9ee', fg: '#4a6b8a' },
  { bg: '#efe6ea', fg: '#9a5a72' },
  { bg: '#efe9df', fg: '#9c7b46' },
  { bg: '#e6ece2', fg: '#5f7f5a' },
]

export function CategoryCard({ category, index }: { category: CategoryWithCount; index: number }) {
  const colors = PALETTE[index % PALETTE.length]
  const initial = category.icon || category.name.trim().charAt(0).toUpperCase()

  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="rounded-[18px] border border-soft-2 bg-white px-[18px] py-[22px] transition hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(45,55,48,0.10)]"
    >
      <div
        className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: colors.bg }}
      >
        <span className="font-heading text-xl font-bold" style={{ color: colors.fg }}>
          {initial}
        </span>
      </div>
      <div className="font-heading text-[17px] font-semibold">{category.name}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-muted">{category.recipeCount} recetas</div>
    </Link>
  )
}
