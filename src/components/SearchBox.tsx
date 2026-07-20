export function SearchBox({
  defaultValue = '',
  autoFocus = false,
}: {
  defaultValue?: string
  autoFocus?: boolean
}) {
  return (
    <form action="/buscar" method="GET" className="relative mx-auto max-w-[520px]">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9a9b91"
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.2-3.2" />
      </svg>
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Busca una receta…"
        className="w-full rounded-2xl border border-soft bg-white py-[17px] pr-5 pl-[52px] text-base text-text shadow-[0_6px_20px_rgba(45,55,48,0.06)] outline-none"
      />
    </form>
  )
}
