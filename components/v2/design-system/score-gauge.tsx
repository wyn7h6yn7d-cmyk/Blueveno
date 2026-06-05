"use client";

import { cn } from "@/lib/utils";
import { clampPercent, safeFiniteNumber } from "@/lib/v2/safe-number";
import { v2KpiLabel, v2Supporting } from "@/lib/ui/v2-surface";

type ScoreGaugeProps = {
  score: number | null;
  max?: number;
  label?: string;
  hint?: string;
  size?: number;
  className?: string;
};

function gaugeTone(pct: number): { stroke: string; text: string } {
  if (pct >= 75) return { stroke: "stroke-emerald-400", text: "text-emerald-200" };
  if (pct >= 50) return { stroke: "stroke-amber-400", text: "text-amber-200" };
  return { stroke: "stroke-rose-400", text: "text-rose-200" };
}

export function ScoreGauge({ score, max = 100, label, hint, size = 96, className }: ScoreGaugeProps) {
  const safeMax = Math.max(safeFiniteNumber(max, 100), 1);
  const safeScore = score === null ? null : safeFiniteNumber(score, 0);
  const pct = safeScore === null ? 0 : clampPercent((safeScore / safeMax) * 100);
  const tone = safeScore === null ? { stroke: "stroke-zinc-500", text: "text-zinc-400" } : gaugeTone(pct);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 88 88" className="size-full -rotate-90" aria-hidden>
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            className="stroke-white/[0.08]"
            strokeWidth="6"
          />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            className={cn(tone.stroke, "transition-[stroke-dashoffset] duration-500")}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={safeScore === null ? circumference : offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display text-xl font-semibold tabular-nums", tone.text)}>
            {safeScore === null ? "—" : Math.round(safeScore)}
          </span>
          {label ? <span className={cn(v2Supporting, "text-[10px]")}>{label}</span> : null}
        </div>
      </div>
      {hint ? <p className={cn(v2KpiLabel, "text-center")}>{hint}</p> : null}
    </div>
  );
}
