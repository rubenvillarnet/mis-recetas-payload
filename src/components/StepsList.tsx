export function StepsList({ steps }: { steps: { text: string }[] }) {
  return (
    <div>
      <h2 className="font-heading mb-5 flex items-center gap-2.5 text-xl font-bold">
        <span className="inline-block h-2 w-2 rounded-full bg-[#6a83a0]" />
        Pasos
      </h2>
      <ol className="m-0 flex list-none flex-col gap-[22px] p-0">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="font-heading flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-[#e7ecf1] text-[15px] font-bold text-accent">
              {i + 1}
            </span>
            <p className="m-0 text-[16.5px] leading-relaxed text-[#33352f]">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
