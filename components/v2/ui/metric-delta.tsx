import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricDeltaProps = {
  value: string;
  /** Numeric direction for color — positive, negative, or flat */
  direction?: "up" | "down" | "flat";
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const directionClass = {
  up: "text-emerald-300",
  down: "text-rose-300",
  flat: "text-zinc-500",
} as const;

export function MetricDelta({ value, direction = "flat", label, size = "sm", className }: MetricDeltaProps) {
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono tabular-nums",
        size === "sm" ? "text-[11px]" : "text-[12px]",
        directionClass[direction],
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5")} strokeWidth={2} aria-hidden />
      <span>{value}</span>
      {label ? <span className="text-zinc-600">· {label}</span> : null}
    </span>
  );
}
