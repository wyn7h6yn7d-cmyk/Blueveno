import { ExternalLink } from "lucide-react";

/**
 * Journal + chart link — wide strip emphasizing the TradingView URL (distinct from hero day state).
 */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 relative border-t border-white/[0.07] py-28 sm:scroll-mt-32 sm:py-32 lg:py-44"
      aria-labelledby="day-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,oklch(0.08_0.05_268/0.35)_0%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-[oklch(0.62_0.12_252)]">Record</p>
            <h2
              id="day-heading"
              className="font-display mt-5 text-[clamp(2.25rem,4.5vw,3.35rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-zinc-50"
            >
              The line when the bell stops.
            </h2>
            <p className="mt-7 max-w-[22rem] text-[15px] leading-[1.6] tracking-[-0.02em] text-zinc-500">
              One URL beside the number. Nothing else to reconcile.
            </p>
          </div>

          <div
            className={[
              "relative rounded-[2rem] p-[1px]",
              "bg-[linear-gradient(145deg,oklch(0.44_0.12_252/0.5),oklch(0.2_0.06_268/0.32)_42%,oklch(0.36_0.1_252/0.42))]",
              "shadow-[0_36px_100px_-52px_rgba(0,0,0,0.9)]",
            ].join(" ")}
          >
            <div className="overflow-hidden rounded-[calc(2rem-1px)] border border-white/[0.06] bg-[linear-gradient(168deg,oklch(0.11_0.04_264/0.98),oklch(0.055_0.035_272/0.99))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4 sm:px-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Session</span>
                <span className="rounded-md border border-white/[0.08] bg-black/35 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                  THU · NQ
                </span>
              </div>

              <div className="grid gap-8 px-6 py-8 sm:grid-cols-2 sm:gap-10 sm:px-8 sm:py-10">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Day P&amp;L</p>
                  <p className="font-display mt-3 text-[clamp(2rem,4.5vw,2.75rem)] font-semibold tabular-nums tracking-[-0.05em] text-emerald-200">
                    +$180
                  </p>
                  <blockquote className="mt-6 border-l-2 border-[oklch(0.55_0.14_252/0.55)] pl-5 text-[14px] leading-[1.6] tracking-[-0.015em] text-zinc-400">
                    Stopped after the drive. No afternoon drift.
                  </blockquote>
                </div>

                <div className="flex flex-col justify-center rounded-2xl border border-[oklch(0.52_0.12_252/0.28)] bg-[oklch(0.06_0.04_268/0.65)] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">TradingView</span>
                    <span className="rounded border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-200/90">
                      Linked
                    </span>
                  </div>
                  <p className="mt-4 break-all font-mono text-[11px] leading-relaxed text-[oklch(0.82_0.07_250)] sm:text-[12px]">
                    tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21
                  </p>
                  <a
                    href="https://www.tradingview.com/chart/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl border border-[oklch(0.55_0.12_252/0.45)] bg-[linear-gradient(180deg,oklch(0.2_0.07_262/0.9),oklch(0.1_0.045_268/0.95))] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition hover:border-[oklch(0.62_0.12_252/0.55)]"
                  >
                    Open chart
                    <ExternalLink className="size-3.5 opacity-85" strokeWidth={2} />
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
