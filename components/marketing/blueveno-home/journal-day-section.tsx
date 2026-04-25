import { ExternalLink } from "lucide-react";

/** Journal + linked chart CTA — day strip beside P&L (marketing). */
export function JournalDaySection() {
  return (
    <section
      id="day"
      className="scroll-mt-28 relative border-t border-white/[0.07] py-16 sm:scroll-mt-32 sm:py-20 lg:py-28"
      aria-labelledby="day-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,oklch(0.08_0.05_268/0.35)_0%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-[oklch(0.62_0.12_252)]">Record</p>
            <h2
              id="day-heading"
              className="font-display mt-4 text-[clamp(1.5rem,3.5vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50 sm:mt-5"
            >
              Track the result. Review the behavior.
            </h2>
            <p className="mt-5 max-w-[22rem] text-[14px] leading-[1.6] tracking-[-0.02em] text-zinc-500 sm:mt-6 sm:text-[15px]">
              Log the day, save the chart, and see how you actually traded.
            </p>
          </div>

          <div
            className={[
              "relative rounded-2xl p-[1px] sm:rounded-[1.65rem]",
              "bg-[linear-gradient(145deg,oklch(0.44_0.12_252/0.5),oklch(0.2_0.06_268/0.32)_42%,oklch(0.36_0.1_252/0.42))]",
              "shadow-[0_24px_72px_-44px_rgba(0,0,0,0.88)]",
            ].join(" ")}
          >
            <div className="overflow-hidden rounded-[calc(1rem-1px)] border border-white/[0.06] bg-[linear-gradient(168deg,oklch(0.11_0.04_264/0.98),oklch(0.055_0.035_272/0.99))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:rounded-[calc(1.65rem-1px)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6 sm:py-3.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Session</span>
                <span className="rounded-md border border-white/[0.08] bg-black/35 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                  THU · NQ
                </span>
              </div>

              <div className="grid gap-6 px-4 py-6 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Day P&amp;L</p>
                  <p className="font-display mt-2 text-[clamp(1.5rem,3.5vw,2.1rem)] font-semibold tabular-nums tracking-[-0.045em] text-emerald-200 sm:mt-3">
                    +$180
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded border border-[oklch(0.52_0.12_252/0.28)] bg-[oklch(0.16_0.06_262/0.6)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-200">
                      Focused
                    </span>
                    <span className="rounded border border-emerald-400/25 bg-emerald-500/[0.1] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-200">
                      3/3 discipline
                    </span>
                  </div>
                  <blockquote className="mt-4 border-l-2 border-[oklch(0.55_0.14_252/0.55)] pl-4 text-[13px] leading-[1.6] tracking-[-0.015em] text-zinc-400 sm:mt-5 sm:pl-5 sm:text-[14px]">
                    Stopped after the drive. No afternoon drift.
                  </blockquote>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Followed plan", "Respected stop", "No revenge"].map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-[oklch(0.52_0.12_252/0.26)] bg-[oklch(0.14_0.05_262/0.5)] px-2 py-1 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-zinc-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center rounded-2xl border border-[oklch(0.52_0.12_252/0.28)] bg-[oklch(0.06_0.04_268/0.65)] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Saved chart</span>
                    <span className="rounded border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-200/90">
                      Linked
                    </span>
                  </div>
                  <a
                    href="/signup"
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-[oklch(0.55_0.12_252/0.45)] bg-[linear-gradient(180deg,oklch(0.2_0.07_262/0.9),oklch(0.1_0.045_268/0.95))] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition hover:border-[oklch(0.62_0.12_252/0.55)]"
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
