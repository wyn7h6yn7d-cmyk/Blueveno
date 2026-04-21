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
      className="scroll-mt-28 border-t border-white/[0.06] py-28 sm:scroll-mt-32 sm:py-40"
      aria-labelledby="cal-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="relative">
          <p
            className="pointer-events-none select-none absolute -right-2 -top-6 font-display text-[clamp(4.5rem,18vw,10rem)] font-bold leading-none tracking-[-0.06em] text-white/[0.025] sm:right-4 sm:top-[-1.5rem]"
            aria-hidden
          >
            04
          </p>

          <div className="relative max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-500">Calendar</p>
            <h2
              id="cal-heading"
              className="font-display mt-4 max-w-[16ch] text-[clamp(2rem,4.8vw,2.85rem)] font-semibold tracking-[-0.042em] text-zinc-50"
            >
              The month, in verdict.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-[1.65] tracking-[-0.01em] text-zinc-600">
              Green, red, flat — plus how each week netted out.
            </p>
          </div>
        </div>

        <div className="relative mt-16 sm:mt-20">
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-8 rounded-[1.75rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,oklch(0.42_0.11_252/0.07),transparent_62%)] sm:-inset-x-10" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.07] bg-[linear-gradient(158deg,oklch(0.11_0.045_262/0.9)_0%,oklch(0.055_0.042_268/0.72)_48%,oklch(0.042_0.042_270/0.95)_100%)] shadow-[0_40px_120px_-48px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.28]" aria-hidden />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.12_252/0.35)] to-transparent"
              aria-hidden
            />
            <div className="relative px-4 py-6 sm:px-8 sm:py-9">
              <div className="mb-8 flex flex-col gap-2 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
                <span className="font-display text-[1.85rem] tracking-[-0.045em] text-zinc-100 sm:text-[2.15rem]">April</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Mon → Sun</span>
              </div>

              <div className="mb-3 hidden gap-3 sm:flex">
                <div className="grid min-w-0 flex-1 grid-cols-7 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div
                      key={d}
                      className={`pb-1 text-center font-mono text-[9px] uppercase tracking-[0.18em] ${d === "Sat" || d === "Sun" ? "text-zinc-700" : "text-zinc-500"}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="flex w-[5.5rem] shrink-0 items-end justify-end pb-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[oklch(0.58_0.1_252)]">
                    Total
                  </span>
                </div>
              </div>

              <div className="space-y-5 sm:space-y-4">
                {calendarRows.map((row, ri) => {
                  const sum = weekRowSum(row);
                  return (
                    <div key={`w-${ri}`} className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
                      <div className="mb-1 grid grid-cols-7 gap-1.5 sm:mb-0 sm:hidden">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
                          <div
                            key={`${d}-${idx}`}
                            className={`text-center font-mono text-[8px] uppercase tracking-[0.12em] ${idx >= 5 ? "text-zinc-700" : "text-zinc-600"}`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5 sm:gap-2">
                        {row.map((day, di) => {
                          const tone = dayCellTone(day);
                          const pnl = day ? pnlMap[day] : undefined;
                          const toneClass =
                            tone === "empty"
                              ? "bg-transparent"
                              : tone === "up"
                                ? "bg-emerald-500/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-emerald-400/28"
                                : tone === "down"
                                  ? "bg-rose-500/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-rose-400/28"
                                  : "bg-white/[0.03] ring-1 ring-white/[0.07]";

                          return (
                            <div
                              key={`${ri}-${di}-${day || "x"}`}
                              className={`flex min-h-[3.2rem] flex-col justify-between rounded-[0.4rem] p-2 sm:min-h-[3.65rem] sm:p-2.5 ${toneClass}`}
                            >
                              {day ? (
                                <>
                                  <span className="font-mono text-[10px] tabular-nums text-zinc-500">{day}</span>
                                  <span
                                    className={`font-display text-[12px] tabular-nums tracking-tight sm:text-[13px] ${
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
                      <div className="flex min-h-[2.85rem] items-center justify-between rounded-[0.45rem] border border-[oklch(0.5_0.12_252/0.22)] bg-[linear-gradient(180deg,oklch(0.08_0.04_268/0.85)_0%,oklch(0.055_0.04_268/0.95)_100%)] px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:w-[5.5rem] sm:shrink-0 sm:flex-col sm:justify-center sm:px-2 sm:py-3">
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600 sm:hidden">
                          Week
                        </span>
                        <span
                          className={`font-display text-base tabular-nums tracking-[-0.02em] sm:text-lg ${
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
    </section>
  );
}
