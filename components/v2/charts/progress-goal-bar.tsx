import { cn } from "@/lib/utils";
import { safeFiniteNumber, safeProgressRatio } from "@/lib/v2/safe-number";
import { v2KpiLabel, v2Supporting } from "@/lib/ui/v2-surface";

type ProgressGoalBarProps = {
  value: number;
  goal: number;
  label?: string;
  hint?: string;
  className?: string;
  showValues?: boolean;
};

export function ProgressGoalBar({
  value,
  goal,
  label,
  hint,
  className,
  showValues = true,
}: ProgressGoalBarProps) {
  const safeValue = safeFiniteNumber(value, 0);
  const safeGoal = Math.max(safeFiniteNumber(goal, 0), 1e-6);
  const pct = safeProgressRatio(safeValue, safeGoal);
  const met = safeValue >= safeGoal;

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValues) && (
        <div className="flex items-baseline justify-between gap-3">
          {label ? <p className={v2KpiLabel}>{label}</p> : <span />}
          {showValues ? (
            <span className="font-mono text-[12px] tabular-nums text-zinc-300">
              {safeValue.toFixed(1)} / {safeGoal.toFixed(1)}
            </span>
          ) : null}
        </div>
      )}
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            met ? "bg-emerald-400" : "bg-bv-blue-accent",
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={safeValue}
          aria-valuemin={0}
          aria-valuemax={safeGoal}
          aria-label={label}
        />
      </div>
      {hint ? <p className={v2Supporting}>{hint}</p> : null}
    </div>
  );
}
