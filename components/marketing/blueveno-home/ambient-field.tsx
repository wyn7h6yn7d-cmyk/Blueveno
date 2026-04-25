import { cn } from "@/lib/utils";

/**
 * Marketing backdrop — dark navy base + subtle endlessly drifting chart lines
 * (low contrast, readable content on top; motion respects prefers-reduced-motion).
 */

const VB = { w: 1540, h: 340 } as const;

function sampleY(i: number, n: number, layer: number): number {
  const t = (i / n) * Math.PI * 2;
  const mid = VB.h * (0.52 + layer * 0.028);
  const amp = VB.h * (0.11 - layer * 0.016);
  return (
    mid +
    amp *
      (0.46 * Math.sin(t * 2.26 + layer * 0.62) +
        0.26 * Math.sin(t * 5.1 + layer * 1.04) +
        0.18 * Math.sin(t * 8.6 + layer * 0.44) +
        0.08 * Math.sin(t * 15.4 + layer * 1.38))
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
    stroke: "oklch(0.58 0.1 238)",
    width: 1.25,
    glow: [
      "drop-shadow(0 0 5px oklch(0.66 0.11 238 / 0.44))",
      "drop-shadow(0 0 18px oklch(0.58 0.09 238 / 0.25))",
    ],
  },
  {
    stroke: "oklch(0.52 0.062 212)",
    width: 1.08,
    glow: [
      "drop-shadow(0 0 4px oklch(0.56 0.09 208 / 0.34))",
      "drop-shadow(0 0 13px oklch(0.52 0.07 212 / 0.18))",
    ],
  },
  {
    stroke: "oklch(0.5 0.062 168)",
    width: 0.95,
    glow: [
      "drop-shadow(0 0 3px oklch(0.54 0.08 168 / 0.28))",
      "drop-shadow(0 0 10px oklch(0.48 0.06 172 / 0.16))",
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
  const nodes = [8, 18, 29, 42, 55, 67, 79] as const;

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
      {nodes.map((idx) => {
        const x = (idx / 88) * VB.w;
        const y = sampleY(idx, 88, layerIndex);
        return (
          <circle
            key={`${layerIndex}-${idx}`}
            cx={x}
            cy={y}
            r={layerIndex === 0 ? 2.8 : layerIndex === 1 ? 2.2 : 1.9}
            fill={s.stroke}
            fillOpacity={layerIndex === 0 ? 0.9 : 0.62}
            style={{ filter: glowFilter(layerIndex) }}
          />
        );
      })}
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.046_0.058_266)_0%,oklch(0.027_0.065_272)_44%,oklch(0.019_0.062_278)_100%)]" />
      <div className="absolute inset-0 bg-grid-fine opacity-[0.36]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_78%_55%_at_22%_26%,oklch(0.46_0.15_248/0.3),transparent_62%),radial-gradient(ellipse_65%_45%_at_86%_18%,oklch(0.4_0.13_254/0.24),transparent_58%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.62_0.08_250/0.08)_1px,transparent_1px)] bg-[length:84px_100%] opacity-60" />

      {/* Chart layers — back → front; different speeds + one reverse for parallax */}
      <div className="absolute inset-0 opacity-[0.72] sm:opacity-[0.82]">
        <ChartTrack layerIndex={2} durationSec={188} opacity={0.8} />
        <ChartTrack layerIndex={1} durationSec={138} reverse opacity={0.96} />
        <ChartTrack layerIndex={0} durationSec={112} opacity={1} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(118deg,transparent_0%,transparent_33%,oklch(0.7_0.16_248/0.28)_40%,transparent_46%,transparent_58%,oklch(0.64_0.14_242/0.2)_64%,transparent_70%)]" />

      {/* Restrained edge vignette + slight top wash so hero copy stays crisp */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_125%_85%_at_50%_42%,oklch(0.05_0.04_268/0)_0%,oklch(0.018_0.045_276/0.58)_100%)]"
        style={{ mixBlendMode: "multiply" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.04_0.045_272/0.42)_0%,transparent_28%,transparent_62%,oklch(0.02_0.05_278/0.48)_100%)]" />
    </div>
  );
}
