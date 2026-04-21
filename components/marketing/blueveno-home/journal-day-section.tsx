/**
 * Journal + chart link — editorial, not a dashboard collage.
 */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.15)] py-24 sm:scroll-mt-32 sm:py-32 lg:py-36"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-24">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[oklch(0.58_0.11_252)]">Record</p>
            <h2
              id="day-heading"
              className="font-display mt-6 text-[clamp(2rem,4.5vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.05em] text-zinc-50"
            >
              The line you write when the bell stops.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed tracking-[-0.018em] text-zinc-500">
              Log the session, paste your TradingView URL once, leave a short note. P&amp;L and week totals stay tied to the calendar—no second spreadsheet.
            </p>
            <ul className="mt-10 space-y-3 font-mono text-[12px] leading-relaxed text-zinc-400">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[oklch(0.55_0.12_252/0.8)]" aria-hidden />
                Daily P&amp;L in the row
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[oklch(0.55_0.12_252/0.8)]" aria-hidden />
                Chart link on the same record
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[oklch(0.55_0.12_252/0.8)]" aria-hidden />
                Week readout on the month grid
              </li>
            </ul>
          </div>

          <div className="lg:pt-2">
            <div className="space-y-10 border-l-2 border-[oklch(0.52_0.14_252/0.4)] pl-8 sm:pl-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">Session</p>
                <p className="font-mono mt-3 text-[13px] tracking-[0.1em] text-zinc-400">THU · RTH · NQ</p>
                <p className="font-display mt-6 text-4xl font-bold tabular-nums tracking-[-0.05em] text-emerald-200 sm:text-5xl">+$180</p>
              </div>
              <blockquote className="text-[15px] leading-[1.75] tracking-[-0.015em] text-zinc-400">
                Stopped after the drive. No afternoon drift.
              </blockquote>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-600">TradingView</p>
                <p className="mt-2 font-mono text-[13px] text-[oklch(0.78_0.09_250)]">One URL — same row as the number.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
