import type { LucideIcon } from "lucide-react";
import { InnerPanel } from "@/components/ui/card-system";

type InsightMetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon?: LucideIcon;
  variant?: "default" | "positive" | "negative";
};

const toneMap = {
  default: "neutral",
  positive: "positive",
  negative: "negative",
} as const;

export function InsightMetricCard({ title, value, detail, icon: Icon, variant = "default" }: InsightMetricCardProps) {
  return (
    <InnerPanel
      as="article"
      tone={toneMap[variant]}
      className="px-4 py-4 sm:px-5 sm:py-5"
    >
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-400">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-zinc-400">{title}</p>
          <p className="font-display mt-1 text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-zinc-50 sm:text-[1.5rem]">
            {value}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{detail}</p>
        </div>
      </div>
    </InnerPanel>
  );
}
