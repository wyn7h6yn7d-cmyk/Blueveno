import { ExternalLink } from "lucide-react";

/**
 * Journal + chart link — one product block, no bullet list (avoids repeating calendar copy).
 */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 relative border-t border-white/[0.06] py-28 sm:scroll-mt-32 sm:py-32 lg:py-40"
      aria-labelledby="day-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(45vh,420px)] bg-[radial-gradient(ellipse_80%_60%_at_70%_100%,oklch(0.32_0.1_252/0.12),transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-[oklch(0.62_0.12_252)]">Record</p>
            <h2
              id="day-heading"
              className="font-display mt-5 text-[clamp(2.25rem,4.5vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-zinc-50"
            >
              The line when the bell stops.
            </h2>
            <p className="mt-7 max-w-[22rem] text-[15px] leading-[1.65] tracking-[-0.02em] text-zinc-500">
              One URL beside the number. Nothing else to reconcile.
            </p>
          </div>

          <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,oklch(0.44_0.12_252/0.55),oklch(0.2_0.06_268/0.35)_45%,oklch(0.36_0.1_252/0.45))] p-[1px] shadow-[0_40px_100px_-52px_rgba(0,0,0,0.88)]">
            <div className="overflow-hidden rounded-[calc(1.75rem-1px)] border border-white/[0.06] bg-[linear-gradient(168deg,oklch(0.11_0.04_264/0.98),oklch(0.055_0.035_272/0.99))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sm:px-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Session</span>
                <span className="rounded-md border border-white/[0.08] bg-black/35 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                  THU · NQ
                </span>
              </div>
              <div className="space-y-8 px-6 py-8 sm:px-8 sm:py-10">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Day P&amp;L</p>
                  <p className="font-display mt-3 text-[clamp(2.25rem,5vw,3rem)] font-semibold tabular-nums tracking-[-0.05em] text-emerald-200">
                    +$180
                  </p>
                </div>
                <blockquote className="border-l-2 border-[oklch(0.55_0.14_252/0.55)] pl-6 text-[15px] leading-[1.65] tracking-[-0.015em] text-zinc-400">
                  Stopped after the drive. No afternoon drift.
                </blockquote>
                <div className="rounded-xl border border-[oklch(0.52_0.12_252/0.25)] bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">TradingView</span>
                    <span className="font-mono text-[10px] text-[oklch(0.72_0.1_252)]">Linked</span>
                  </div>
                  <p className="mt-3 truncate font-mono text-[11px] leading-relaxed text-[oklch(0.78_0.08_250)]">
                    tradingview.com/chart/…
                  </p>
                  <a
                    href="https://www.tradingview.com/chart/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.72_0.11_252)] transition hover:text-zinc-200"
                  >
                    Open chart
                    <ExternalLink className="size-3.5 opacity-80" strokeWidth={2} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
