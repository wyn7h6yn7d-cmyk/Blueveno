/**
 * Single journal day as editorial showcase — not a dashboard card.
 */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.15)] py-24 sm:scroll-mt-32 sm:py-32 lg:py-36"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[oklch(0.58_0.11_252)]">Journal</p>
            <h2
              id="day-heading"
              className="font-display mt-6 text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.05em] text-zinc-50"
            >
              The line you write when the bell stops.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed tracking-[-0.018em] text-zinc-500">
              One screen: result, context, chart link. Nothing else asking for attention.
            </p>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[oklch(0.52_0.14_252/0.35)] via-transparent to-[oklch(0.52_0.14_252/0.08)] opacity-90"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.52_0.12_252/0.2)] bg-[linear-gradient(165deg,oklch(0.09_0.05_262/0.95)_0%,oklch(0.045_0.045_272/0.98)_100%)] p-8 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "linear-gradient(oklch(0.52_0.12_252/0.25) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52_0.12_252/0.25) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                aria-hidden
              />

              <div className="relative flex flex-col gap-10">
                <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.14em] text-zinc-500">THU · 24 APR · RTH</p>
                    <p className="font-display mt-4 text-2xl font-semibold tracking-[-0.04em] text-zinc-50 sm:text-3xl">NQ · Long bias</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">P&amp;L</p>
                    <p className="font-display mt-1 text-5xl font-bold tabular-nums leading-none tracking-[-0.05em] text-emerald-200 sm:text-6xl">
                      +$180
                    </p>
                  </div>
                </div>

                <div className="space-y-4 border-l-2 border-[oklch(0.52_0.14_252/0.45)] pl-6 text-[15px] leading-[1.75] tracking-[-0.015em] text-zinc-400">
                  <p>Stopped after the drive. No afternoon drift.</p>
                  <p>Risk capped. Book respected.</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-zinc-600">
                  <span>0.5R</span>
                  <span className="text-zinc-700">·</span>
                  <span>VWAP</span>
                  <span className="text-zinc-700">·</span>
                  <span>Opening drive</span>
                </div>

                <div className="border-t border-white/[0.08] pt-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">TradingView</p>
                  <p className="mt-2 font-mono text-[13px] text-[oklch(0.78_0.09_250)]">Paste once — same row as the number.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
