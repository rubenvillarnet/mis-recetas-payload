export function IngredientsSidebar({
  ingredients,
  label,
}: {
  ingredients: { text: string }[]
  label?: string | null
}) {
  return (
    <aside className="rounded-[18px] border border-soft-2 bg-white px-6 pt-6 pb-[26px] nav:sticky nav:top-24">
      <h2 className="font-heading mb-1 flex items-center gap-2.5 text-xl font-bold">
        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
        Ingredientes
      </h2>
      {label && <p className="mb-4 text-[13px] font-semibold text-muted">{label}</p>}
      <ul className={`m-0 flex list-none flex-col gap-2.5 p-0 ${label ? '' : 'mt-4'}`}>
        {ingredients.map((ing, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15.5px] leading-snug text-[#40423c]">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#bcc4cf]" />
            <span>{ing.text}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
