const items = [
  { title: "Log the day", line: "Markets, result, one honest line." },
  { title: "Save the chart", line: "TradingView URL beside the story." },
  { title: "See the week", line: "Totals without another sheet." },
] as const;

export function ValueStrip() {
  return (
    <section
      id="core"
      className="scroll-mt-28 border-t border-white/[0.08] py-[clamp(4.5rem,12vw,6.5rem)] sm:scroll-mt-32"
      aria-labelledby="core-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <h2 id="core-heading" className="sr-only">
          Core
        </h2>

        <div className="hidden lg:grid lg:grid-cols-3 lg:divide-x lg:divide-white/[0.08]">
          {items.map((item) => (
            <div key={item.title} className="px-10 py-1 text-center first:pl-4 last:pr-4">
              <p className="font-display text-[clamp(1.05rem,1.5vw,1.2rem)] font-semibold tracking-[-0.042em] text-zinc-100">
                {item.title}
              </p>
              <p className="mx-auto mt-3.5 max-w-[24ch] text-[13px] leading-[1.65] tracking-[-0.012em] text-zinc-600">
                {item.line}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-14 lg:hidden">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <p className="font-display text-lg font-semibold tracking-[-0.04em] text-zinc-100">{item.title}</p>
              <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-zinc-600">{item.line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
