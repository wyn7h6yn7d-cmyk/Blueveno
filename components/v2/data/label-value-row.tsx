import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2KpiLabel, v2MonoMeta, v2Supporting } from "@/lib/ui/v2-surface";

type LabelValueRowProps = {
  label: ReactNode;
  value: ReactNode;
  hint?: string;
  dense?: boolean;
  align?: "spread" | "stack";
  className?: string;
  valueClassName?: string;
};

export function LabelValueRow({
  label,
  value,
  hint,
  dense = false,
  align = "spread",
  className,
  valueClassName,
}: LabelValueRowProps) {
  return (
    <div
      className={cn(
        align === "spread" ? "flex items-baseline justify-between gap-3" : "space-y-1",
        dense ? "py-1.5" : "py-2",
        className,
      )}
    >
      <span className={cn(v2KpiLabel, "shrink-0")}>{label}</span>
      <div className={cn("min-w-0 text-right", align === "stack" && "text-left")}>
        <div className={cn("font-mono text-[13px] tabular-nums text-zinc-100", valueClassName)}>{value}</div>
        {hint ? <p className={cn(v2Supporting, "mt-0.5")}>{hint}</p> : null}
      </div>
    </div>
  );
}

export function LabelValueGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const colClass = columns === 3 ? "sm:grid-cols-3" : columns === 1 ? "grid-cols-1" : "sm:grid-cols-2";
  return (
    <div className={cn("grid grid-cols-1 gap-x-6 divide-y divide-white/[0.05]", colClass, className)}>
      {children}
    </div>
  );
}

export function LabelValueMeta({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn(v2MonoMeta, "normal-case tracking-normal", className)}>{children}</span>;
}
