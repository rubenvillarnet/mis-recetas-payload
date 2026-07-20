'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category } from '@/payload-types'

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú"
        className="nav:hidden flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-soft bg-white"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4e47" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4c4e47" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="animate-fade-up absolute top-full right-0 left-0 border-b border-soft bg-white shadow-[0_16px_30px_rgba(45,55,48,0.10)]">
          <div className="mx-auto flex max-w-[1080px] flex-col px-4 pt-2 pb-3.5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="border-b border-[#efece4] py-3.5 px-2 text-base font-bold text-text"
            >
              Inicio
            </Link>
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                onClick={() => setOpen(false)}
                className={`py-3.5 px-2 text-base font-bold text-[#4c4e47] ${
                  i < categories.length - 1 ? 'border-b border-[#efece4]' : ''
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
