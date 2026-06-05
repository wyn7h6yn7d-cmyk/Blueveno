import { cn } from "@/lib/utils";
import { v2MonoMeta } from "@/lib/ui/v2-surface";

type ScoreBadgeProps = {
  score: number | null;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

function scoreTone(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 75) return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
  if (pct >= 50) return "border-sky-400/25 bg-sky-500/10 text-sky-100";
  if (pct >= 25) return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-rose-400/30 bg-rose-500/10 text-rose-100";
}

export function ScoreBadge({ score, max = 100, label, size = "sm", className }: ScoreBadgeProps) {
  const display = score === null || !Number.isFinite(score) ? "—" : `${Math.round(score)}`;
  const tone = score === null || !Number.isFinite(score) ? "border-white/[0.1] bg-white/[0.03] text-zinc-400" : scoreTone(score, max);

  return (
    <span
      className={cn(
        "inline-flex flex-col items-center rounded-lg border px-2 py-1",
        size === "sm" ? "min-w-[2.5rem]" : "min-w-[3rem] px-2.5 py-1.5",
        tone,
        className,
      )}
      title={label}
    >
      <span className={cn("font-mono font-semibold tabular-nums", size === "sm" ? "text-[13px]" : "text-[15px]")}>
        {display}
      </span>
      {label ? <span className={cn(v2MonoMeta, "mt-0.5 max-w-[5rem] truncate normal-case")}>{label}</span> : null}
    </span>
  );
}
