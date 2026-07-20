import Link from 'next/link'
import { getAllCategories } from '@/lib/queries'
import { MobileNav } from './MobileNav'

export async function Header() {
  const categories = await getAllCategories()

  return (
    <header className="sticky top-0 z-20 border-b border-soft bg-bg/92 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-[1080px] items-center gap-5 px-4 py-3 nav:px-7">
        <Link href="/" className="mr-auto flex min-w-0 flex-none items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M8 3v7M11 3v7M8 3v18M16 3c-1.5 0-2 2-2 5s.5 5 2 5v8" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-heading text-[15px] font-bold whitespace-nowrap text-text nav:text-[17px]">
              En mi casa se cocina así
            </div>
            <div className="hidden text-[11px] font-bold tracking-widest text-muted uppercase nav:block">
              Recetario de familia
            </div>
          </div>
        </Link>

        <nav className="hidden gap-1 nav:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categoria/${category.slug}`}
              className="rounded-[9px] px-3 py-2 text-sm font-bold text-[#4c4e47] hover:bg-[#eceae2] hover:text-text"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <MobileNav categories={categories} />
      </div>
    </header>
  )
}
