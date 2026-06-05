import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2InsetCell, v2KpiLabel, v2MonoMeta } from "@/lib/ui/v2-surface";

export type StatStripItem = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative" | "caution";
  icon?: LucideIcon;
};

const toneClass = {
  neutral: "text-zinc-50",
  positive: "text-emerald-200",
  negative: "text-rose-200",
  caution: "text-amber-200",
} as const;

type StatStripProps = {
  items: StatStripItem[];
  className?: string;
};

export function StatStrip({ items, className }: StatStripProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2",
        items.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        className,
      )}
      role="list"
    >
      {items.map((item) => (
        <div key={item.id} className={cn(v2InsetCell, "flex items-center gap-3 px-3 py-2.5")} role="listitem">
          {item.icon ? (
            <item.icon className="size-4 shrink-0 text-zinc-500" strokeWidth={1.75} aria-hidden />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className={v2KpiLabel}>{item.label}</p>
            <p className={cn("mt-0.5 font-mono text-[14px] tabular-nums", toneClass[item.tone ?? "neutral"])}>
              {item.value}
            </p>
            {item.hint ? <p className={cn(v2MonoMeta, "mt-0.5 normal-case")}>{item.hint}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
