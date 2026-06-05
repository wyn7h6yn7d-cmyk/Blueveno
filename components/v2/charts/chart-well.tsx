import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2ChartWell } from "@/lib/ui/v2-surface";

type ChartWellProps = {
  children: ReactNode;
  className?: string;
  /** Show fine grid texture behind chart content */
  grid?: boolean;
  /** Accessible label for the chart region */
  label?: string;
  height?: "sm" | "md" | "lg" | "auto";
};

const heightClass: Record<NonNullable<ChartWellProps["height"]>, string> = {
  sm: "min-h-[9rem]",
  md: "min-h-[14rem]",
  lg: "min-h-[18rem]",
  auto: "min-h-0",
};

export function ChartWell({ children, className, grid = true, label, height = "md" }: ChartWellProps) {
  return (
    <div
      className={cn(
        v2ChartWell,
        "relative overflow-hidden",
        grid && "bg-grid-fine",
        heightClass[height],
        className,
      )}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <div className="relative h-full w-full p-3 sm:p-4">{children}</div>
    </div>
  );
}
