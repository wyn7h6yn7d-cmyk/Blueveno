import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2Supporting } from "@/lib/ui/v2-surface";

type ChartEmptyProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function ChartEmpty({
  title = "Not enough data yet",
  description = "Log a few trading days to unlock this chart.",
  icon: Icon = BarChart3,
  action,
  className,
  compact = false,
}: ChartEmptyProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[inherit] flex-col items-center justify-center px-4 text-center",
        compact ? "py-6" : "py-10",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-500">
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-3 text-[13px] font-medium text-zinc-300">{title}</p>
      <p className={cn(v2Supporting, "mt-1.5 max-w-xs")}>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
