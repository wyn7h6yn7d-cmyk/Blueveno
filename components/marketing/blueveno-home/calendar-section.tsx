import { calendarRows, dayCellTone, pnlMap, weekRowSum } from "./data";

function formatWeekTotal(n: number) {
  if (n === 0) return "—";
  const sign = n > 0 ? "+" : "−";
  return `${sign}$${Math.abs(n)}`;
}

function formatDay(pnl: number | undefined) {
  if (pnl === undefined) return "—";
  if (pnl === 0) return "—";
  const sign = pnl > 0 ? "+" : "−";
  return `${sign}$${Math.abs(pnl)}`;
}

export function CalendarSection() {
  return (
    <section
      id="calendar"
      className="scroll-mt-28 relative border-t border-white/[0.08] py-28 sm:scroll-mt-32 sm:py-32 lg:py-40"
      aria-labelledby="cal-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,420px)] bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,oklch(0.35_0.12_252/0.14),transparent_72%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 max-w-2xl lg:mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.42em] text-[oklch(0.55_0.12_252)]">Calendar</p>
          <h2
            id="cal-heading"
            className="font-display mt-5 text-[clamp(2.15rem,5.8vw,3.85rem)] font-bold leading-[1.02] tracking-[-0.052em] text-zinc-50"
          >
            The month, in verdict.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-[1.55] tracking-[-0.018em] text-zinc-600">
            Green, red, flat — plus how each week netted out.
          </p>
        </div>

        <div className="relative border border-white/[0.1] bg-[oklch(0.042_0.045_270)] shadow-[0_60px_140px_-56px_rgba(0,0,0,0.92)]">
          <div className="flex flex-col lg:flex-row">
            <div
              className="flex h-16 items-center justify-center border-b border-white/[0.08] bg-[oklch(0.055_0.045_268)] lg:h-auto lg:w-20 lg:shrink-0 lg:border-b-0 lg:border-r lg:border-white/[0.08]"
              aria-hidden
            >
              <span
                className="font-display text-3xl font-bold tracking-[-0.06em] text-[oklch(0.48_0.12_252/0.35)] lg:hidden"
              >
                APR
              </span>
              <span
                className="hidden font-display text-[clamp(3.5rem,5vw,4.5rem)] font-bold leading-none tracking-[-0.07em] text-[oklch(0.48_0.12_252/0.22)] lg:block [writing-mode:vertical-rl]"
                style={{ writingMode: "vertical-rl" }}
              >
                APR
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between border-b border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.085_0.05_262/0.4)_0%,transparent_100%)] px-4 py-5 sm:px-8 sm:py-6">
                <span className="font-display text-2xl tracking-[-0.05em] text-zinc-100 sm:text-3xl">April</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">Mon — Sun</span>
              </div>

              <div className="px-3 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
                <div className="mb-4 hidden gap-2 sm:flex lg:mb-5">
                  <div className="grid min-w-0 flex-1 grid-cols-7 gap-2 lg:gap-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div
                        key={d}
                        className={`pb-1 text-center font-mono text-[9px] uppercase tracking-[0.2em] lg:text-[10px] ${d === "Sat" || d === "Sun" ? "text-zinc-600" : "text-zinc-500"}`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="flex w-[5.75rem] shrink-0 items-end justify-center pb-1 lg:w-[6.25rem]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[oklch(0.62_0.11_252)]">
                      Week
                    </span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-3">
                  {calendarRows.map((row, ri) => {
                    const sum = weekRowSum(row);
                    return (
                      <div
                        key={`w-${ri}`}
                        className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-stretch sm:gap-2 sm:border-b-0 sm:pb-0 lg:gap-3"
                      >
                        <div className="mb-1 grid grid-cols-7 gap-1.5 sm:mb-0 sm:hidden">
                          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
                            <div
                              key={`${d}-${idx}`}
                              className={`text-center font-mono text-[8px] uppercase tracking-[0.1em] ${idx >= 5 ? "text-zinc-600" : "text-zinc-500"}`}
                            >
                              {d}
                            </div>
                          ))}
                        </div>

                        <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
                          {row.map((day, di) => {
                            const tone = dayCellTone(day);
                            const pnl = day ? pnlMap[day] : undefined;
                            const weekend = di >= 5;
                            const toneClass =
                              tone === "empty"
                                ? weekend
                                  ? "bg-[oklch(0.07_0.035_270/0.5)]"
                                  : "bg-transparent"
                                : tone === "up"
                                  ? "bg-emerald-500/[0.22] ring-1 ring-emerald-400/32"
                                  : tone === "down"
                                    ? "bg-rose-500/[0.22] ring-1 ring-rose-400/32"
                                    : "bg-white/[0.04] ring-1 ring-white/[0.07]";

                            return (
                              <div
                                key={`${ri}-${di}-${day || "x"}`}
                                className={`flex min-h-[3.5rem] flex-col justify-between rounded-sm p-2 sm:min-h-[4.25rem] sm:p-2.5 ${toneClass}`}
                              >
                                {day ? (
                                  <>
                                    <span className="font-mono text-[10px] tabular-nums text-zinc-500">{day}</span>
                                    <span
                                      className={`font-display text-[13px] tabular-nums tracking-tight sm:text-sm ${
                                        typeof pnl === "number"
                                          ? pnl > 0
                                            ? "text-emerald-100"
                                            : pnl < 0
                                              ? "text-rose-100"
                                              : "text-zinc-400"
                                          : "text-zinc-600"
                                      }`}
                                    >
                                      {formatDay(pnl)}
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex min-h-[3rem] items-center justify-between border-t border-white/[0.08] px-3 py-2.5 sm:w-[5.75rem] sm:shrink-0 sm:flex-col sm:justify-center sm:border-t-0 sm:border-l sm:border-white/[0.08] sm:bg-[oklch(0.055_0.04_268/0.5)] sm:px-2 sm:py-4 lg:w-[6.25rem]">
                          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500 sm:hidden">
                            Wk
                          </span>
                          <span
                            className={`font-display text-lg tabular-nums tracking-[-0.03em] lg:text-xl ${
                              sum > 0 ? "text-emerald-100" : sum < 0 ? "text-rose-100" : "text-zinc-500"
                            }`}
                          >
                            {formatWeekTotal(sum)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
