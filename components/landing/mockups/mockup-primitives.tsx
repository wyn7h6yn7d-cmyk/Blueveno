import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Monospace section label — product UI chrome */
export function MockLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500", className)}>
      {children}
    </p>
  );
}

export function MockKpiCell({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-bv-surface-inset/95 px-2.5 py-2 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]",
        className,
      )}
    >
      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-600">{label}</p>
      <p
        className={cn(
          "mt-0.5 font-display text-[15px] tabular-nums leading-none tracking-tight sm:text-base",
          accent ? "text-zinc-50" : "text-zinc-200",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 font-mono text-[8px] text-zinc-600">{hint}</p> : null}
    </div>
  );
}

type PillTone = "ok" | "warn" | "bad" | "neutral";

const pillTone: Record<PillTone, string> = {
  ok: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300/95",
  warn: "border-amber-500/25 bg-amber-500/10 text-amber-200/90",
  bad: "border-red-500/25 bg-red-500/10 text-red-300/90",
  neutral: "border-white/[0.08] bg-white/[0.04] text-zinc-400",
};

export function MockPill({ children, tone = "neutral" }: { children: ReactNode; tone?: PillTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.12em]",
        pillTone[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Thin table chrome for dense mock data */
export function MockTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border/60", className)}>
      {children}
    </div>
  );
}

export function MockTh({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-border/60 bg-black/30 px-2 py-1.5 text-left font-mono text-[8px] font-medium uppercase tracking-[0.14em] text-zinc-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function MockTd({
  children,
  mono,
  className,
}: {
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-b border-white/[0.04] px-2 py-1.5 text-[11px] leading-tight text-zinc-300",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** Inline SVG sparkline — deterministic path for marketing */
export function MockSparkline({
  className,
  positive = true,
}: {
  className?: string;
  positive?: boolean;
}) {
  const stroke = positive ? "oklch(0.62 0.12 252)" : "oklch(0.62 0.12 25)";
  return (
    <svg
      className={cn("h-8 w-full", className)}
      viewBox="0 0 120 28"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0,22 C12,20 22,14 36,16 C48,18 58,8 72,10 C86,12 94,4 120,6"
        fill="none"
        stroke={stroke}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        opacity={0.9}
      />
    </svg>
  );
}
