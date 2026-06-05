import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2Supporting } from "@/lib/ui/v2-surface";

type EmptyStatePanelProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function EmptyStatePanel({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStatePanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-12",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-500">
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-3 text-[14px] font-medium text-zinc-200">{title}</h3>
      <p className={cn(v2Supporting, "mt-1.5 max-w-sm text-[13px] leading-relaxed")}>{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
