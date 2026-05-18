"use client";

import { cn } from "@/lib/utils";

export type DonutMetricProps = {
  green: number;
  red: number;
  /** List legend, compact inline dots, or hidden */
  legend?: boolean | "inline";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const GREEN = "oklch(0.55 0.14 155)";
const RED = "oklch(0.55 0.16 20)";
const NEUTRAL = "oklch(0.32 0.02 260)";

function donutState(green: number, red: number) {
  const greenSafe = Number.isFinite(green) ? Math.max(0, green) : 0;
  const redSafe = Number.isFinite(red) ? Math.max(0, red) : 0;
  const total = greenSafe + redSafe;

  if (total === 0) {
    return {
      total: 0,
      centerMain: "—",
      centerSub: "No days yet",
      gradient: `${NEUTRAL} 0% 100%`,
      legendGreen: 0,
      legendRed: 0,
    };
  }

  if (redSafe === 0) {
    return {
      total,
      centerMain: "100%",
      centerSub: "green days",
      gradient: `${GREEN} 0% 100%`,
      legendGreen: greenSafe,
      legendRed: 0,
    };
  }

  if (greenSafe === 0) {
    return {
      total,
      centerMain: "0%",
      centerSub: "green days",
      gradient: `${RED} 0% 100%`,
      legendGreen: 0,
      legendRed: redSafe,
    };
  }

  const greenShare = greenSafe / total;
  const pct = Math.round(greenShare * 100);
  return {
    total,
    centerMain: `${pct}%`,
    centerSub: "green days",
    gradient: `${GREEN} 0% ${(greenShare * 100).toFixed(2)}%, ${RED} ${(greenShare * 100).toFixed(2)}% 100%`,
    legendGreen: greenSafe,
    legendRed: redSafe,
  };
}

export function DonutMetric({
  green,
  red,
  legend = true,
  size = "md",
  className,
}: DonutMetricProps) {
  const state = donutState(green, red);
  const ringSize =
    size === "lg" ? "size-[9.5rem]" : size === "sm" ? "size-[5.75rem]" : "size-[7.25rem]";
  const centerMainClass =
    size === "sm"
      ? "text-[1.15rem] sm:text-[1.2rem]"
      : size === "lg"
        ? "text-[1.45rem] sm:text-[1.6rem]"
        : "text-[1.35rem] sm:text-[1.45rem]";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn("relative shrink-0 rounded-full", ringSize)}
        style={{ background: `conic-gradient(${state.gradient})` }}
        role="img"
        aria-label={
          state.total > 0
            ? `Green days ${state.legendGreen}, red days ${state.legendRed}, ${state.centerMain} green`
            : "No trading days yet"
        }
      >
        <div
          className={cn(
            "absolute inset-[16%] flex flex-col items-center justify-center rounded-full",
            "bg-[oklch(0.11_0.034_264/0.98)] ring-1 ring-white/[0.1]",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]",
          )}
        >
          <p
            className={cn(
              "font-display font-semibold leading-none tabular-nums tracking-[-0.04em] text-zinc-50",
              centerMainClass,
            )}
          >
            {state.centerMain}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium text-zinc-500">{state.centerSub}</p>
        </div>
      </div>

      {legend === "inline" && state.total > 0 ? (
        <div className="mt-3 flex items-center gap-4 text-[12px] tabular-nums">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-emerald-300/90">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
            {state.legendGreen}
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-rose-300/90">
            <span className="size-2 rounded-full bg-rose-400" aria-hidden />
            {state.legendRed}
          </span>
        </div>
      ) : null}
      {legend === true && state.total > 0 ? (
        <ul className="mt-4 space-y-1.5 text-[13px]">
          <li className="flex items-center gap-2 whitespace-nowrap">
            <span className="size-2 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span className="text-zinc-400">
              Green days: <span className="tabular-nums text-emerald-200">{state.legendGreen}</span>
            </span>
          </li>
          <li className="flex items-center gap-2 whitespace-nowrap">
            <span className="size-2 shrink-0 rounded-full bg-rose-400" aria-hidden />
            <span className="text-zinc-400">
              Red days: <span className="tabular-nums text-rose-200">{state.legendRed}</span>
            </span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
