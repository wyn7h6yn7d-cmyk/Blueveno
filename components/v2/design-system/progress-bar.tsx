"use client";

import { ProgressGoalBar } from "@/components/v2/charts/progress-goal-bar";
import { safeFiniteNumber } from "@/lib/v2/safe-number";

type ProgressBarProps = {
  value: number;
  goal: number;
  label?: string;
  hint?: string;
  className?: string;
  showValues?: boolean;
};

/** Goal progress bar with safe numeric coercion. Green when met, blue while in progress. */
export function ProgressBar({ value, goal, ...props }: ProgressBarProps) {
  return (
    <ProgressGoalBar
      value={safeFiniteNumber(value, 0)}
      goal={Math.max(safeFiniteNumber(goal, 0), 1e-6)}
      {...props}
    />
  );
}
