export function FootnoteBox({ text }: { text: string }) {
  return (
    <div className="mt-[34px] rounded-[14px] border border-[#dbe2ea] border-l-4 border-l-[#8aa0bb] bg-[#eef1f5] px-[22px] py-5">
      <div className="font-heading mb-1.5 text-sm font-medium text-[#4f6a86] italic">Nota de la cocina</div>
      <p className="font-heading m-0 text-base text-[#414852] italic">{text}</p>
    </div>
  )
}
