import { cn } from "@/lib/utils";

type GreenRedRatioBarProps = {
  green: number;
  red: number;
  className?: string;
};

export function GreenRedRatioBar({ green, red, className }: GreenRedRatioBarProps) {
  const total = green + red;
  const greenPct = total > 0 ? Math.round((green / total) * 100) : 0;
  const redPct = total > 0 ? 100 - greenPct : 0;

  if (total === 0) {
    return <div className={cn("h-2 rounded-full bg-white/[0.08]", className)} aria-hidden />;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/[0.06]">
        {greenPct > 0 ? (
          <div
            className="h-full bg-gradient-to-r from-emerald-500/90 to-emerald-400/70"
            style={{ width: `${greenPct}%` }}
          />
        ) : null}
        {redPct > 0 ? (
          <div
            className="h-full bg-gradient-to-r from-rose-500/85 to-rose-400/65"
            style={{ width: `${redPct}%` }}
          />
        ) : null}
      </div>
      <p className="text-[13px] text-zinc-400">
        <span className="tabular-nums text-emerald-200/95">{green}</span>
        <span className="text-zinc-600"> green · </span>
        <span className="tabular-nums text-rose-200/95">{red}</span>
        <span className="text-zinc-600"> red</span>
      </p>
    </div>
  );
}
