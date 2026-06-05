import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { StatusPill, type StatusPillTone } from "@/components/v2/data/status-pill";
import { cn } from "@/lib/utils";
import { v2InsetCell, v2ModuleTitle, v2Supporting } from "@/lib/ui/v2-surface";

export type InsightSeverity = "neutral" | "positive" | "negative" | "warning" | "info";

const severityToPill: Record<InsightSeverity, StatusPillTone> = {
  neutral: "neutral",
  positive: "success",
  negative: "danger",
  warning: "warning",
  info: "info",
};

const severityBorder: Record<InsightSeverity, string> = {
  neutral: "border-white/[0.07]",
  positive: "border-emerald-400/20",
  negative: "border-rose-400/20",
  warning: "border-amber-400/20",
  info: "border-sky-400/20",
};

type InsightCardProps = {
  title: string;
  body: string;
  severity?: InsightSeverity;
  tag?: string;
  metric?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function InsightCard({
  title,
  body,
  severity = "neutral",
  tag,
  metric,
  icon: Icon,
  action,
  className,
}: InsightCardProps) {
  return (
    <article className={cn(v2InsetCell, "px-4 py-3.5", severityBorder[severity], className)}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400">
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={cn(v2ModuleTitle, "text-[0.9rem]")}>{title}</h4>
            {tag ? <StatusPill tone={severityToPill[severity]}>{tag}</StatusPill> : null}
          </div>
          {metric ? <p className="mt-1 font-mono text-[13px] tabular-nums text-zinc-200">{metric}</p> : null}
          <p className={cn(v2Supporting, "mt-2 leading-relaxed")}>{body}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </article>
  );
}
