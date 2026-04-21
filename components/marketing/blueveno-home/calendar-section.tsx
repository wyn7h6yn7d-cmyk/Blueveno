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
      className="scroll-mt-28 relative border-t border-[oklch(0.52_0.12_252/0.2)] py-24 sm:scroll-mt-32 sm:py-32 lg:py-40"
      aria-labelledby="cal-heading"
    >
      {/* Signature wash — cobalt, sharp */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(55vh,520px)] bg-[linear-gradient(180deg,oklch(0.42_0.14_252/0.12)_0%,transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-12">
        <div className="mb-16 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[oklch(0.58_0.12_252)]">Signature</p>
            <h2
              id="cal-heading"
              className="font-display mt-6 max-w-[14ch] text-[clamp(2.75rem,8vw,5rem)] font-bold leading-[0.95] tracking-[-0.06em] text-zinc-50"
            >
              The month,
              <br />
              <span className="text-gradient-cobalt">in color.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed tracking-[-0.018em] text-zinc-500 lg:text-right">
            Green and red days, weekly totals on the rail — no spreadsheet aftertaste.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.48_0.14_252/0.4)] bg-[linear-gradient(180deg,oklch(0.07_0.05_262/0.95)_0%,oklch(0.038_0.045_272/0.98)_100%)] shadow-[0_80px_160px_-64px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col lg:flex-row">
            {/* Month spine */}
            <div className="flex items-center justify-center border-b border-[oklch(0.52_0.12_252/0.15)] bg-[oklch(0.055_0.05_268)] py-8 lg:w-[min(22%,200px)] lg:border-b-0 lg:border-r lg:py-0">
              <span
                className="font-display text-[clamp(4rem,12vw,7rem)] font-bold leading-none tracking-[-0.08em] text-[oklch(0.48_0.14_252/0.45)] lg:[writing-mode:vertical-rl] lg:rotate-180"
                style={{ writingMode: "vertical-rl" }}
              >
                APR
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between border-b border-[oklch(0.52_0.12_252/0.12)] px-5 py-6 sm:px-10 sm:py-8">
                <span className="font-display text-3xl tracking-[-0.05em] text-zinc-100 sm:text-4xl">April</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">Mon — Sun · weekly close</span>
              </div>

              <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                <div className="mb-6 hidden gap-3 sm:flex">
                  <div className="grid min-w-0 flex-1 grid-cols-7 gap-2 lg:gap-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div
                        key={d}
                        className={`pb-1 text-center font-mono text-[9px] uppercase tracking-[0.22em] lg:text-[10px] ${d === "Sat" || d === "Sun" ? "text-zinc-600" : "text-zinc-500"}`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="flex w-[6.5rem] shrink-0 items-end justify-center pb-1 lg:w-[7.25rem]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[oklch(0.62_0.12_252)]">
                      Week
                    </span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-2">
                  {calendarRows.map((row, ri) => {
                    const sum = weekRowSum(row);
                    return (
                      <div
                        key={`w-${ri}`}
                        className="flex flex-col gap-3 border-b border-[oklch(0.52_0.12_252/0.08)] pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-stretch sm:gap-3 sm:border-b-0 sm:pb-0 lg:gap-4"
                      >
                        <div className="mb-1 grid grid-cols-7 gap-1.5 sm:mb-0 sm:hidden">
                          {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
                            <div
                              key={`${d}-${idx}`}
                              className={`text-center font-mono text-[8px] uppercase tracking-[0.12em] ${idx >= 5 ? "text-zinc-600" : "text-zinc-500"}`}
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
                                  ? "bg-[oklch(0.06_0.035_270/0.6)]"
                                  : "bg-transparent"
                                : tone === "up"
                                  ? "bg-emerald-500/[0.26] shadow-[inset_0_0_0_1px_oklch(0.65_0.14_155/0.4)]"
                                  : tone === "down"
                                    ? "bg-rose-500/[0.24] shadow-[inset_0_0_0_1px_oklch(0.62_0.18_15/0.38)]"
                                    : "bg-white/[0.05] shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]";

                            return (
                              <div
                                key={`${ri}-${di}-${day || "x"}`}
                                className={`flex min-h-[4rem] flex-col justify-between rounded-md p-2.5 sm:min-h-[4.75rem] sm:p-3 ${toneClass}`}
                              >
                                {day ? (
                                  <>
                                    <span className="font-mono text-[10px] tabular-nums text-zinc-500">{day}</span>
                                    <span
                                      className={`font-display text-sm tabular-nums tracking-tight sm:text-[15px] ${
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

                        <div className="flex min-h-[3.5rem] items-center justify-between border-t border-[oklch(0.52_0.12_252/0.12)] px-3 py-3 sm:w-[6.5rem] sm:shrink-0 sm:flex-col sm:justify-center sm:border-t-0 sm:border-l sm:border-[oklch(0.52_0.12_252/0.12)] sm:bg-[oklch(0.055_0.045_268/0.6)] sm:px-2 sm:py-5 lg:w-[7.25rem]">
                          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 sm:hidden">
                            Wk
                          </span>
                          <span
                            className={`font-display text-xl tabular-nums tracking-[-0.04em] lg:text-2xl ${
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
