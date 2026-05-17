import Link from "next/link";
import { ArrowUpRight, BarChart3, CalendarDays, Landmark, NotebookPen } from "lucide-react";
import {
  OVERVIEW_ONBOARDING_EMPTY_COPY,
  type OverviewOnboardingItem,
} from "@/lib/onboarding/overview-checklist";
import { cn } from "@/lib/utils";

const ITEM_ICONS = {
  account: Landmark,
  "first-day": NotebookPen,
  calendar: CalendarDays,
  stats: BarChart3,
} as const;

type Props = {
  items: OverviewOnboardingItem[];
};

export function OverviewOnboardingChecklist({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Getting started"
      className={cn(
        "rounded-2xl border border-[oklch(0.55_0.12_252/0.28)]",
        "bg-[linear-gradient(158deg,oklch(0.16_0.044_258/0.92),oklch(0.1_0.032_266/0.94))]",
        "px-4 py-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_20px_56px_-40px_oklch(0.48_0.14_252/0.35)] sm:px-5 sm:py-4",
        "ring-1 ring-[oklch(0.58_0.1_252/0.14)]",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[12px] font-medium tracking-wide text-[oklch(0.72_0.1_252)]">Getting started</p>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-zinc-400">{OVERVIEW_ONBOARDING_EMPTY_COPY}</p>
        </div>
        <p className="shrink-0 text-[12px] tabular-nums text-zinc-500">
          {items.length} step{items.length === 1 ? "" : "s"} left
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => {
          const Icon = ITEM_ICONS[item.id];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-[background,box-shadow]",
                  "bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]",
                  "hover:bg-white/[0.06] hover:ring-white/[0.1]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)]",
                )}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/25 text-[12px] font-medium tabular-nums text-zinc-400"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <Icon className="size-4 shrink-0 text-[oklch(0.78_0.1_252)] opacity-90" strokeWidth={1.75} aria-hidden />
                <span className="min-w-0 flex-1 text-[14px] font-medium text-zinc-100">{item.label}</span>
                <ArrowUpRight
                  className="size-4 shrink-0 text-zinc-500 transition group-hover:text-zinc-300"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
