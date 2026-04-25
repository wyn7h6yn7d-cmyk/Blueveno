import { cn } from "@/lib/utils";

/**
 * Marketing backdrop — dark navy base + subtle endlessly drifting chart lines
 * (low contrast, readable content on top; motion respects prefers-reduced-motion).
 */

const VB = { w: 1200, h: 280 } as const;

function sampleY(i: number, n: number, layer: number): number {
  const t = (i / n) * Math.PI * 2;
  const mid = VB.h * (0.48 + layer * 0.032);
  const amp = VB.h * (0.1 - layer * 0.014);
  return (
    mid +
    amp *
      (0.42 * Math.sin(t * 2.1 + layer * 0.62) +
        0.24 * Math.sin(t * 4.7 + layer * 1.04) +
        0.18 * Math.sin(t * 8.6 + layer * 0.44) +
        0.08 * Math.sin(t * 14.8 + layer * 1.38))
  );
}

function buildLineD(layer: number): string {
  const n = 88;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    pts.push([(i / n) * VB.w, sampleY(i, n, layer)]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
}

function buildAreaD(lineD: string): string {
  return `${lineD} L ${VB.w} ${VB.h} L 0 ${VB.h} Z`;
}

const LINE_PATHS = [0, 1, 2].map((layer) => buildLineD(layer));
const AREA_PATH_0 = buildAreaD(LINE_PATHS[0]);

const STROKES = [
  {
    stroke: "oklch(0.56 0.08 236)",
    width: 1.2,
    glow: [
      "drop-shadow(0 0 4px oklch(0.62 0.1 236 / 0.38))",
      "drop-shadow(0 0 16px oklch(0.56 0.08 236 / 0.22))",
    ],
  },
  {
    stroke: "oklch(0.5 0.058 210)",
    width: 1.05,
    glow: [
      "drop-shadow(0 0 3px oklch(0.54 0.08 205 / 0.3))",
      "drop-shadow(0 0 12px oklch(0.5 0.07 208 / 0.16))",
    ],
  },
  {
    stroke: "oklch(0.48 0.06 168)",
    width: 0.95,
    glow: [
      "drop-shadow(0 0 3px oklch(0.52 0.08 168 / 0.25))",
      "drop-shadow(0 0 9px oklch(0.46 0.06 172 / 0.14))",
    ],
  },
] as const;

function glowFilter(layerIndex: 0 | 1 | 2): string {
  return STROKES[layerIndex].glow.join(" ");
}

function ChartPanel({
  layerIndex,
  className,
}: {
  layerIndex: 0 | 1 | 2;
  className?: string;
}) {
  const id = `bv-ambient-${layerIndex}`;
  const s = STROKES[layerIndex];
  const lineD = LINE_PATHS[layerIndex];

  return (
    <svg
      className={cn("h-full w-1/2 shrink-0 [shape-rendering:geometricPrecision]", className)}
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        {layerIndex === 0 ? (
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.52 0.08 230)" stopOpacity="0.14" />
            <stop offset="55%" stopColor="oklch(0.14 0.04 268)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="oklch(0.06 0.03 272)" stopOpacity="0" />
          </linearGradient>
        ) : null}
      </defs>
      {layerIndex === 0 ? (
        <path d={AREA_PATH_0} fill={`url(#${id}-fill)`} stroke="none" />
      ) : null}
      <path
        d={lineD}
        fill="none"
        stroke={s.stroke}
        strokeWidth={s.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: glowFilter(layerIndex) }}
      />
    </svg>
  );
}

function ChartTrack({
  layerIndex,
  durationSec,
  reverse,
  opacity,
}: {
  layerIndex: 0 | 1 | 2;
  durationSec: number;
  reverse?: boolean;
  opacity: number;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className={cn(
          "bv-chart-ambient-track absolute left-0 top-0 flex h-full w-[200%]",
          reverse && "bv-chart-ambient-track--reverse",
        )}
        style={{ ["--bv-drift" as string]: `${durationSec}s` }}
      >
        <ChartPanel layerIndex={layerIndex} />
        <ChartPanel layerIndex={layerIndex} />
      </div>
    </div>
  );
}

export function AmbientField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      {/* Base */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.045_0.05_266)_0%,oklch(0.028_0.056_272)_44%,oklch(0.02_0.056_278)_100%)]" />
      <div className="absolute inset-0 bg-grid-fine opacity-[0.2]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_55%_at_22%_26%,oklch(0.4_0.12_248/0.18),transparent_62%),radial-gradient(ellipse_65%_45%_at_86%_18%,oklch(0.36_0.1_254/0.14),transparent_58%)]" />

      {/* Chart layers — back → front; different speeds + one reverse for parallax */}
      <div className="absolute inset-0 opacity-[0.46] sm:opacity-[0.52]">
        <ChartTrack layerIndex={2} durationSec={196} opacity={0.6} />
        <ChartTrack layerIndex={1} durationSec={146} reverse opacity={0.78} />
        <ChartTrack layerIndex={0} durationSec={112} opacity={1} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(118deg,transparent_0%,transparent_33%,oklch(0.66_0.15_248/0.12)_40%,transparent_46%,transparent_58%,oklch(0.6_0.13_242/0.08)_64%,transparent_70%)]" />

      {/* Restrained edge vignette + slight top wash so hero copy stays crisp */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_125%_85%_at_50%_42%,oklch(0.05_0.04_268/0)_0%,oklch(0.018_0.045_276/0.72)_100%)]"
        style={{ mixBlendMode: "multiply" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.04_0.045_272/0.5)_0%,transparent_28%,transparent_62%,oklch(0.02_0.05_278/0.55)_100%)]" />
    </div>
  );
}
