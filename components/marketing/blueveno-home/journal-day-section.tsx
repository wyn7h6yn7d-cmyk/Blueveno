/**
 * Journal as typographic specimen — rule + type, no dashboard shell.
 */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 border-t border-white/[0.08] py-28 sm:scroll-mt-32 sm:py-36"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[oklch(0.55_0.12_252)]">Day</p>
          <h2
            id="day-heading"
            className="font-display mt-5 text-[clamp(2rem,4.8vw,3rem)] font-bold leading-[1.08] tracking-[-0.048em] text-zinc-50"
          >
            The entry you actually finish.
          </h2>
          <p className="mt-5 text-[15px] leading-[1.55] tracking-[-0.018em] text-zinc-600">
            Enough structure to review. Quiet enough to think.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl border-l-2 border-[oklch(0.52_0.14_252/0.45)] pl-8 sm:pl-12 lg:mt-24">
          <div className="space-y-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
              <div>
                <p className="font-mono text-[11px] tracking-[0.12em] text-zinc-500">THU · 24 APR · RTH</p>
                <p className="font-display mt-4 text-[1.65rem] font-bold tracking-[-0.035em] text-zinc-50 sm:text-3xl">
                  NQ · Long bias
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">P&amp;L</p>
                <p className="font-display mt-1 text-[2.75rem] font-bold leading-none tracking-[-0.045em] text-emerald-200 sm:text-[3.25rem]">
                  +$180
                </p>
              </div>
            </div>

            <div className="space-y-5 text-[16px] leading-[1.85] tracking-[-0.015em] text-zinc-400">
              <p>Stopped after the drive. No afternoon drift.</p>
              <p>Risk capped at half a point. Book respected.</p>
            </div>

            <p className="font-mono text-[12px] tracking-[-0.01em] text-zinc-500">
              <span className="text-zinc-600">0.5R</span>
              <span className="mx-2 text-zinc-700">/</span>
              <span className="text-zinc-600">VWAP</span>
              <span className="mx-2 text-zinc-700">/</span>
              <span className="text-zinc-600">Opening drive</span>
            </p>

            <div className="border-t border-white/[0.08] pt-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-500">TradingView</p>
              <p className="mt-2 font-mono text-[14px] tracking-[-0.02em] text-[oklch(0.78_0.09_250)]">
                Paste lands here — same screen as the number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
