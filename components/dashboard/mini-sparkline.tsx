"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type MiniSparklineProps = {
  positive?: boolean;
  className?: string;
};

export function MiniSparkline({ positive = true, className }: MiniSparklineProps) {
  const uid = useId();
  const lineGrad = `bv-line-${uid}`;
  const areaGrad = `bv-area-${uid}`;

  return (
    <svg
      className={cn("h-10 w-full overflow-visible", className)}
      viewBox="0 0 120 36"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={lineGrad} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.5 0.14 250)" />
          <stop offset="100%" stopColor="oklch(0.78 0.1 255)" />
        </linearGradient>
        <linearGradient id={areaGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.18 250 / 0.22)" />
          <stop offset="100%" stopColor="oklch(0.55 0.18 250 / 0)" />
        </linearGradient>
      </defs>
      {positive ? (
        <>
          <path
            d="M0,28 C15,26 25,22 38,18 C52,14 58,20 72,12 C86,4 92,10 120,6 L120,36 L0,36 Z"
            fill={`url(#${areaGrad})`}
          />
          <path
            d="M0,28 C15,26 25,22 38,18 C52,14 58,20 72,12 C86,4 92,10 120,6"
            fill="none"
            stroke={`url(#${lineGrad})`}
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : (
        <path
          d="M0,10 C20,14 40,8 60,18 C80,28 100,22 120,26"
          fill="none"
          stroke="oklch(0.65 0.14 25 / 0.9)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
