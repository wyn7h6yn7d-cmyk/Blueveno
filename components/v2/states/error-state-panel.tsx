import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2Supporting } from "@/lib/ui/v2-surface";

type ErrorStatePanelProps = {
  title?: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function ErrorStatePanel({
  title = "Something went wrong",
  description,
  action,
  compact = false,
  className,
}: ErrorStatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-12",
        className,
      )}
      role="alert"
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-rose-400/25 bg-rose-500/10 text-rose-200">
        <AlertTriangle className="size-4" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-3 text-[14px] font-medium text-rose-100">{title}</h3>
      <p className={cn(v2Supporting, "mt-1.5 max-w-sm text-[13px] leading-relaxed")}>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
