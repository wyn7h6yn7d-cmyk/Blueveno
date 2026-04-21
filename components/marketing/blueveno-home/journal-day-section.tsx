export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 py-28 sm:scroll-mt-32 sm:py-36"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-500">Day</p>
          <h2
            id="day-heading"
            className="font-display mt-5 text-[clamp(1.95rem,4.2vw,2.5rem)] font-semibold tracking-[-0.04em] text-zinc-50"
          >
            The entry you actually finish.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed tracking-[-0.01em] text-zinc-600">
            Enough structure to review. Quiet enough to think.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-3xl">
          <div
            className="pointer-events-none absolute -left-px top-[12%] hidden h-[76%] w-px bg-gradient-to-b from-[oklch(0.55_0.12_252/0.08)] via-[oklch(0.55_0.12_252/0.35)] to-[oklch(0.55_0.12_252/0.08)] lg:block"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-px top-[12%] hidden h-[76%] w-px bg-gradient-to-b from-[oklch(0.55_0.12_252/0.08)] via-[oklch(0.55_0.12_252/0.35)] to-[oklch(0.55_0.12_252/0.08)] lg:block"
            aria-hidden
          />

          <article className="rounded-[1.2rem] bg-[linear-gradient(168deg,oklch(0.09_0.04_262/0.95)_0%,oklch(0.052_0.04_268)_60%,oklch(0.045_0.042_270)_100%)] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_32px_80px_-40px_rgba(0,0,0,0.75)]">
            <div className="rounded-[1.14rem] px-6 py-8 sm:px-10 sm:py-11">
              <header className="flex flex-col gap-5 border-b border-white/[0.055] pb-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[11px] tracking-[-0.02em] text-zinc-500">
                    Thursday · 24 April · RTH
                  </p>
                  <h3 className="font-display mt-3 text-[1.65rem] font-semibold tracking-[-0.03em] text-zinc-50">
                    NQ · Long bias
                  </h3>
                </div>
                <div className="flex items-baseline gap-2.5 sm:text-right">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">P&amp;L</span>
                  <span className="font-display text-[2.15rem] tabular-nums leading-none tracking-[-0.04em] text-emerald-200">
                    +$180
                  </span>
                </div>
              </header>

              <div className="mt-9 space-y-6 text-[15px] leading-[1.85] tracking-[-0.015em] text-zinc-500">
                <p>Stopped after the drive. No afternoon drift.</p>
                <p>Risk capped at half a point. Book respected.</p>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {["0.5R", "VWAP", "Opening drive"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[0.35rem] border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] tracking-tight text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-11 border-t border-white/[0.055] pt-9">
                <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-500">TradingView</p>
                <div className="mt-3 flex items-center gap-2 text-[oklch(0.78_0.09_250)]">
                  <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M14 3h7v7M10 14L21 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-mono text-[13px] tracking-[-0.02em]">
                    Paste lands here — same screen as the number.
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
