"use client";

import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { calendarRows, dayCellTone, pnlMap, weekRowSum } from "./data";
import { cn } from "@/lib/utils";

type HeroMode = "day" | "chart" | "week";

const modes: { id: HeroMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "week", label: "Week" },
];

const order: HeroMode[] = ["day", "chart", "week"];

const heroWeekRow = calendarRows[1]!;

const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

function modeAtRatio(t: number): HeroMode {
  const i = Math.min(2, Math.max(0, Math.round(Math.min(1, Math.max(0, t)) * 2)));
  return order[i]!;
}

export function HeroSection() {
  const [mode, setMode] = useState<HeroMode>("day");
  const groupId = useId();
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrubRef = useRef<HTMLDivElement>(null);
  const scrubActiveRef = useRef(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [dragRatio, setDragRatio] = useState<number | null>(null);
  const [highlight, setHighlight] = useState({ left: 0, width: 0, ready: false });

  const modeIndex = order.indexOf(mode);

  /** 0 = Day, 0.5 = Chart, 1 = Week — aligns thumb center along the track */
  const idleRatio = modeIndex / 2;
  const thumbRatio = dragRatio ?? idleRatio;

  const go = useCallback((m: HeroMode) => setMode(m), []);

  const applyScrubClientX = useCallback((clientX: number) => {
    const el = scrubRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setDragRatio(t);
    const next = modeAtRatio(t);
    setMode((prev) => (prev === next ? prev : next));
  }, []);

  const endScrub = useCallback(() => {
    scrubActiveRef.current = false;
    setIsScrubbing(false);
    setDragRatio(null);
  }, []);

  const onScrubPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      scrubActiveRef.current = true;
      setIsScrubbing(true);
      e.currentTarget.setPointerCapture(e.pointerId);
      applyScrubClientX(e.clientX);
    },
    [applyScrubClientX],
  );

  const onScrubPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!scrubActiveRef.current) return;
      applyScrubClientX(e.clientX);
    },
    [applyScrubClientX],
  );

  const onScrubPointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!scrubActiveRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      endScrub();
    },
    [endScrub],
  );

  const updateHighlight = useCallback(() => {
    const list = tabListRef.current;
    const btn = tabRefs.current[modeIndex];
    if (!list || !btn) return;
    const lr = list.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    setHighlight({ left: br.left - lr.left, width: br.width, ready: true });
  }, [modeIndex]);

  useLayoutEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  useEffect(() => {
    const list = tabListRef.current;
    if (!list || typeof window === "undefined") return;
    const ro = new ResizeObserver(() => updateHighlight());
    ro.observe(list);
    const onResize = () => updateHighlight();
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [updateHighlight]);

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const i = order.indexOf(mode);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = (i + 1) % order.length;
        go(order[next]!);
        queueMicrotask(() => tabRefs.current[next]?.focus());
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (i - 1 + order.length) % order.length;
        go(order[prev]!);
        queueMicrotask(() => tabRefs.current[prev]?.focus());
      }
    },
    [go, mode],
  );

  return (
    <section
      className="relative overflow-hidden pt-[calc(4.5rem+env(safe-area-inset-top))] pb-16 sm:pb-20"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] mx-auto h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-[oklch(0.55_0.14_252/0.4)] to-transparent px-5 sm:px-8" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="items-stretch gap-12 lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-16">
          <div className="lg:col-span-5 xl:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[oklch(0.55_0.12_252)]">Trading journal</p>
            <h1
              id="hero-heading"
              className="font-display mt-9 text-left text-[clamp(2.75rem,9vw,5.25rem)] font-bold leading-[0.9] tracking-[-0.06em] text-zinc-50 sm:mt-10"
            >
              Clarity
              <br />
              at the{" "}
              <span className="text-gradient-cobalt [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">close.</span>
            </h1>
            <p className="mt-8 max-w-[36ch] text-[15px] leading-[1.55] tracking-[-0.02em] text-zinc-500">
              Your session, your chart, your numbers — one disciplined surface.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <PremiumPrimaryLink href="/signup">Open Blueveno</PremiumPrimaryLink>
              <PremiumGhostLink href="/app">Enter workspace</PremiumGhostLink>
            </div>
          </div>

          <div className="mt-14 flex min-h-[min(400px,58vh)] flex-col lg:col-span-7 lg:mt-4">
            <div
              className="mb-5 flex w-full justify-stretch sm:justify-end lg:justify-start"
              role="tablist"
              aria-label="Preview mode"
              onKeyDown={onTabKeyDown}
            >
              <div
                ref={tabListRef}
                className="relative grid w-full grid-cols-3 gap-0 rounded-2xl border border-white/[0.1] bg-[oklch(0.042_0.04_270/0.92)] p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:inline-flex sm:w-auto sm:grid-cols-none sm:rounded-full sm:p-1"
              >
                {highlight.ready ? (
                  <span
                    className="pointer-events-none absolute inset-y-1 rounded-xl bg-[oklch(0.56_0.13_252)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_32px_-12px_oklch(0.45_0.14_252/0.55)] transition-[transform,width,opacity] duration-500 ease-out motion-reduce:transition-none sm:rounded-full"
                    style={{
                      width: highlight.width,
                      transform: `translateX(${highlight.left}px)`,
                      opacity: 1,
                      transitionTimingFunction: ease,
                    }}
                    aria-hidden
                  />
                ) : null}
                {modes.map((m, i) => {
                  const selected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${groupId}-${m.id}`}
                      aria-selected={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => go(m.id)}
                      className={cn(
                        "relative z-[1] min-h-[48px] touch-manipulation rounded-xl px-3 py-3 text-[13px] font-semibold tracking-[-0.02em] transition-colors duration-300 sm:min-h-[44px] sm:rounded-full sm:px-5 sm:py-2.5 sm:text-[12px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.14_252/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.04_0.04_270)]",
                        "active:scale-[0.98] motion-reduce:active:scale-100",
                        selected ? "text-[oklch(0.055_0.045_268)]" : "text-zinc-500 hover:text-zinc-200",
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horizontal scrub: same three modes as tabs; tactile reveal control */}
            <div className="mt-5 w-full max-w-md lg:max-w-none" aria-hidden="true">
              <div
                ref={scrubRef}
                role="presentation"
                className="relative h-11 w-full cursor-grab select-none active:cursor-grabbing sm:h-10"
                style={{ touchAction: isScrubbing ? "none" : "pan-y" }}
                onPointerDown={onScrubPointerDown}
                onPointerMove={onScrubPointerMove}
                onPointerUp={onScrubPointerUp}
                onPointerCancel={onScrubPointerUp}
                onLostPointerCapture={endScrub}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  aria-hidden
                />
                <div
                  className={cn(
                    "pointer-events-none absolute left-0 top-1/2 h-[3px] max-w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-[oklch(0.52_0.13_252/0.55)] via-[oklch(0.48_0.12_252/0.35)] to-transparent opacity-90",
                    isScrubbing ? "" : "transition-[width] duration-500 motion-reduce:transition-none",
                  )}
                  style={{
                    width: `${thumbRatio * 100}%`,
                    transitionTimingFunction: ease,
                  }}
                  aria-hidden
                />
                <div
                  className={cn(
                    "pointer-events-none absolute top-1/2 h-2.5 w-[2.75rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.14] bg-[oklch(0.56_0.13_252)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_10px_36px_-14px_oklch(0.42_0.14_252/0.75)] sm:h-2 sm:w-11",
                    isScrubbing ? "" : "transition-[left] duration-500 motion-reduce:transition-none",
                  )}
                  style={{
                    left: `${thumbRatio * 100}%`,
                    transitionTimingFunction: ease,
                  }}
                  aria-hidden
                />
              </div>
            </div>

            <div
              id={`${groupId}-panel`}
              role="tabpanel"
              aria-labelledby={`${groupId}-${mode}`}
              aria-live="polite"
              className="relative flex min-h-0 flex-1 flex-col rounded-[1.35rem] bg-gradient-to-b from-white/[0.1] via-white/[0.03] to-transparent p-[1px] shadow-[0_0_0_1px_oklch(0.48_0.14_252/0.28),0_40px_100px_-48px_rgba(0,0,0,0.88)]"
            >
              <div className="relative flex min-h-[min(320px,42vh)] flex-1 flex-col overflow-hidden rounded-[1.28rem] border border-white/[0.06] bg-[linear-gradient(168deg,oklch(0.11_0.05_262)_0%,oklch(0.055_0.042_268)_55%,oklch(0.038_0.044_272)_100%)] sm:min-h-[340px]">
                <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.2]" aria-hidden />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden />

                <Panel visible={mode === "day"}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] tracking-[0.14em] text-zinc-500">THU · 24 APR · RTH</p>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                      NQ
                    </span>
                  </div>
                  <p className="font-mono mt-8 text-[10px] uppercase tracking-[0.32em] text-zinc-500">P&amp;L</p>
                  <p className="font-display mt-2 text-[clamp(2.5rem,7.5vw,3.75rem)] font-bold tabular-nums leading-none tracking-[-0.05em] text-emerald-200 sm:text-[clamp(2.75rem,6vw,4rem)]">
                    +$180
                  </p>
                  <p className="mt-8 max-w-prose flex-1 border-l-2 border-[oklch(0.52_0.14_252/0.45)] pl-4 text-[14px] leading-[1.75] text-zinc-400">
                    Opening drive only. Size held. No revenge after the flush.
                  </p>
                </Panel>

                <Panel visible={mode === "chart"}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Linked chart</p>
                  <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-lg border border-white/[0.08] bg-[oklch(0.06_0.04_268/0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                    <div className="relative aspect-[16/10] min-h-[140px] w-full flex-1 overflow-hidden rounded-t-lg sm:min-h-[160px]">
                      <div className="absolute inset-0 bg-[linear-gradient(165deg,oklch(0.14_0.06_262/0.5)_0%,oklch(0.06_0.04_268/0.3)_100%)]" />
                      <div
                        className="absolute inset-0 opacity-[0.35]"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                          backgroundSize: "22px 22px",
                        }}
                        aria-hidden
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <span className="font-mono text-[10px] text-zinc-500">Preview</span>
                        <span className="font-mono text-[11px] tabular-nums text-zinc-400">NQ1!</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="min-w-0 truncate font-mono text-[11px] text-[oklch(0.82_0.09_250)] sm:text-[12px]">
                        tradingview.com/chart · NQ1!
                      </p>
                      <a
                        href="https://www.tradingview.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full border border-[oklch(0.52_0.14_252/0.35)] bg-white/[0.04] px-5 py-2.5 text-[12px] font-semibold tracking-[-0.02em] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition hover:border-[oklch(0.58_0.14_252/0.45)] hover:bg-white/[0.07] active:scale-[0.98] motion-reduce:active:scale-100"
                      >
                        Open chart
                      </a>
                    </div>
                  </div>
                </Panel>

                <Panel visible={mode === "week"}>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Week strip</p>
                    <p className="mt-2 font-mono text-[11px] text-zinc-500">Apr 3 — 9 · demo</p>
                  </div>
                  <div className="mt-5 flex min-h-0 flex-1 flex-col justify-center gap-4">
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {heroWeekRow.map((day, di) => {
                        const tone = dayCellTone(day);
                        const pnl = day ? pnlMap[day] : undefined;
                        const toneClass =
                          tone === "empty"
                            ? "bg-transparent"
                            : tone === "up"
                              ? "bg-emerald-500/[0.22] ring-1 ring-emerald-400/35"
                              : tone === "down"
                                ? "bg-rose-500/[0.2] ring-1 ring-rose-400/32"
                                : "bg-white/[0.04] ring-1 ring-white/[0.08]";
                        const display =
                          typeof pnl === "number" && pnl !== 0
                            ? `${pnl > 0 ? "+" : "−"}$${Math.abs(pnl)}`
                            : "—";

                        return (
                          <div
                            key={`${day}-${di}`}
                            className={cn(
                              "flex min-h-[2.75rem] flex-col justify-between rounded-md p-1 sm:min-h-[3.35rem] sm:p-2",
                              toneClass,
                            )}
                          >
                            {day ? (
                              <>
                                <span className="font-mono text-[8px] text-zinc-500 sm:text-[9px]">{day}</span>
                                <span
                                  className={cn(
                                    "font-display text-[10px] tabular-nums leading-tight sm:text-[11px]",
                                    typeof pnl === "number" && pnl > 0
                                      ? "text-emerald-100"
                                      : typeof pnl === "number" && pnl < 0
                                        ? "text-rose-100"
                                        : "text-zinc-500",
                                  )}
                                >
                                  {display}
                                </span>
                              </>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Week total</span>
                      <span className="font-display text-lg tabular-nums tracking-[-0.03em] text-emerald-100 sm:text-2xl">
                        {(() => {
                          const s = weekRowSum(heroWeekRow);
                          if (s === 0) return "—";
                          return `${s > 0 ? "+" : "−"}$${Math.abs(s)}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col p-6 will-change-transform sm:p-8",
        "transition-[opacity,transform] duration-500 motion-reduce:duration-0",
        visible
          ? "z-[2] translate-y-0 opacity-100"
          : "pointer-events-none z-0 translate-y-3 opacity-0 sm:translate-y-2",
      )}
      style={{ transitionTimingFunction: ease }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  );
}
