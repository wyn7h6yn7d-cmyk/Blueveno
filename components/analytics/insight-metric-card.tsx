import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightMetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon?: LucideIcon;
  variant?: "default" | "positive" | "negative";
};

const variantClass = {
  default:
    "border-[oklch(0.58_0.1_252/0.22)] bg-[linear-gradient(160deg,oklch(0.15_0.04_260/0.88),oklch(0.095_0.03_264/0.92))] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05),0_0_32px_-20px_oklch(0.48_0.14_252/0.35)]",
  positive:
    "border-emerald-400/22 bg-emerald-500/[0.08] shadow-[inset_0_1px_0_0_oklch(0.88_0.06_155/0.12),0_0_28px_-18px_oklch(0.42_0.16_155/0.35)]",
  negative:
    "border-rose-400/22 bg-rose-500/[0.08] shadow-[inset_0_1px_0_0_oklch(0.9_0.05_15/0.1),0_0_28px_-18px_oklch(0.42_0.18_15/0.32)]",
} as const;

export function InsightMetricCard({ title, value, detail, icon: Icon, variant = "default" }: InsightMetricCardProps) {
  return (
    <article className={cn("rounded-2xl border px-4 py-4 sm:px-5 sm:py-5", variantClass[variant])}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-[oklch(0.78_0.11_252)]">
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
    </article>
  );
}
