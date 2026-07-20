import Link from 'next/link'

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="mb-4.5 text-sm font-semibold text-muted">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link href={item.href} className="text-muted hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#4c4e47]">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2 text-[#c3c2b8]">›</span>}
        </span>
      ))}
    </div>
  )
}
