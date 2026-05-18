"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

type PnlTrendSparklineProps = {
  points: number[];
  className?: string;
  height?: number;
  /** When set, line/fill use green (true) or red (false). Otherwise uses last point sign. */
  positive?: boolean;
};

export function PnlTrendSparkline({
  points,
  className,
  height = 48,
  positive: positiveProp,
}: PnlTrendSparklineProps) {
  const uid = useId();
  const lineId = `${uid}-pnl-line`;
  const areaId = `${uid}-pnl-area`;
  const glowId = `${uid}-pnl-glow`;

  const path = useMemo(() => {
    const valid = points.filter((p) => Number.isFinite(p));
    if (valid.length < 2) return null;

    const w = 120;
    const h = 40;
    const pad = 5;
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
    const lastVal = valid[valid.length - 1] ?? 0;
    const positive = positiveProp ?? lastVal >= 0;
    const last = coords[coords.length - 1]!;

    return { line, area, positive, last, w, h };
  }, [points, positiveProp]);

  if (!path) {
    return (
      <div
        className={cn("rounded-lg bg-white/[0.02]", className)}
        style={{ height }}
        aria-hidden
      />
    );
  }

  const strokeMain = path.positive ? "oklch(0.62 0.14 155)" : "oklch(0.62 0.15 25)";
  const strokeEnd = path.positive ? "oklch(0.78 0.12 155)" : "oklch(0.72 0.14 25)";
  const fillTop = path.positive ? "oklch(0.52 0.14 155 / 0.28)" : "oklch(0.52 0.14 25 / 0.24)";
  const dotFill = path.positive ? "oklch(0.72 0.13 155)" : "oklch(0.68 0.14 25)";
  const dotStroke = path.positive ? "oklch(0.88 0.08 155 / 0.5)" : "oklch(0.88 0.06 25 / 0.45)";

  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      viewBox={`0 0 ${path.w} ${path.h}`}
      preserveAspectRatio="none"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={lineId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={strokeMain} />
          <stop offset="100%" stopColor={strokeEnd} />
        </linearGradient>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop} />
          <stop offset="55%" stopColor={path.positive ? "oklch(0.48 0.12 155 / 0.08)" : "oklch(0.48 0.12 25 / 0.06)"} />
          <stop offset="100%" stopColor="oklch(0.45 0.1 252 / 0)" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={path.area} fill={`url(#${areaId})`} />
      <path
        d={path.line}
        fill="none"
        stroke={`url(#${lineId})`}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />
      <circle
        cx={path.last.x}
        cy={path.last.y}
        r="2.75"
        fill={dotFill}
        stroke={dotStroke}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
