"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

type PnlTrendSparklineProps = {
  points: number[];
  className?: string;
  height?: number;
};

export function PnlTrendSparkline({ points, className, height = 44 }: PnlTrendSparklineProps) {
  const uid = useId();
  const lineId = `${uid}-pnl-line`;
  const areaId = `${uid}-pnl-area`;

  const path = useMemo(() => {
    const valid = points.filter((p) => Number.isFinite(p));
    if (valid.length < 2) return null;

    const w = 120;
    const h = 36;
    const pad = 4;
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const span = Math.max(max - min, 1e-6);

    const coords = valid.map((y, i) => {
      const x = pad + (i / Math.max(valid.length - 1, 1)) * (w - pad * 2);
      const ny = pad + (1 - (y - min) / span) * (h - pad * 2);
      return { x, y: ny };
    });

    const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(" ");
    const area = `${line} L${coords[coords.length - 1]!.x.toFixed(2)},${h} L${coords[0]!.x.toFixed(2)},${h} Z`;
    const last = valid[valid.length - 1] ?? 0;
    const positive = last >= 0;

    return { line, area, positive };
  }, [points]);

  if (!path) {
    return (
      <div
        className={cn("rounded-lg bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]", className)}
        style={{ height }}
        aria-hidden
      />
    );
  }

  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      viewBox="0 0 120 36"
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={path.positive ? "oklch(0.48 0.12 155)" : "oklch(0.52 0.14 25)"} />
          <stop offset="100%" stopColor={path.positive ? "oklch(0.72 0.12 155)" : "oklch(0.65 0.14 25)"} />
        </linearGradient>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={path.positive ? "oklch(0.5 0.14 155 / 0.2)" : "oklch(0.5 0.14 25 / 0.18)"}
          />
          <stop offset="100%" stopColor="oklch(0.5 0.14 252 / 0)" />
        </linearGradient>
      </defs>
      <path d={path.area} fill={`url(#${areaId})`} />
      <path
        d={path.line}
        fill="none"
        stroke={`url(#${lineId})`}
        strokeWidth="1.35"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
