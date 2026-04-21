const items = [
  { title: "Log the day", line: "Markets, result, one honest line." },
  { title: "Save the chart", line: "TradingView URL beside the story." },
  { title: "See the week", line: "Totals without another sheet." },
] as const;

export function ValueStrip() {
  return (
    <section
      id="core"
      className="scroll-mt-28 border-t border-white/[0.06] py-28 sm:scroll-mt-32 sm:py-36"
      aria-labelledby="core-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <h2 id="core-heading" className="sr-only">
          Core use
        </h2>
        <div className="grid gap-16 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/[0.055]">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`relative text-center sm:px-8 lg:px-14 ${i > 0 ? "border-t border-white/[0.06] pt-16 sm:border-t-0 sm:pt-0" : ""}`}
            >
              <p className="font-display text-[clamp(1.2rem,2.4vw,1.45rem)] font-semibold tracking-[-0.038em] text-zinc-50">
                {item.title}
              </p>
              <p className="mx-auto mt-4 max-w-[22ch] text-[14px] leading-[1.7] tracking-[-0.01em] text-zinc-600">
                {item.line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
