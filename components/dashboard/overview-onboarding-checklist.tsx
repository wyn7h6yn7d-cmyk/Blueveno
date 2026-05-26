import Link from "next/link";
import { ArrowUpRight, BarChart3, CalendarDays, Landmark, NotebookPen } from "lucide-react";
import {
  OVERVIEW_ONBOARDING_EMPTY_COPY,
  type OverviewOnboardingItem,
} from "@/lib/onboarding/overview-checklist";
import { appCardShell, appEyebrow } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

const ITEM_ICONS = {
  account: Landmark,
  "first-day": NotebookPen,
  calendar: CalendarDays,
  stats: BarChart3,
} as const;

type Props = {
  items: OverviewOnboardingItem[];
  onDismiss?: () => void;
  dismissBusy?: boolean;
};

export function OverviewOnboardingChecklist({ items, onDismiss, dismissBusy }: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Getting started" className={cn(appCardShell, "px-4 py-4 sm:px-5 sm:py-4")}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className={appEyebrow}>Getting started</p>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-zinc-400">{OVERVIEW_ONBOARDING_EMPTY_COPY}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <p className="text-[12px] tabular-nums text-zinc-500">
            {items.length} step{items.length === 1 ? "" : "s"} left
          </p>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              disabled={dismissBusy}
              className="text-[12px] text-zinc-500 transition hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hide tutorial
            </button>
          ) : null}
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => {
          const Icon = ITEM_ICONS[item.id];
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 transition-[background,border-color]",
                  "hover:border-white/[0.12] hover:bg-white/[0.04]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/35",
                )}
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-black/25 text-[12px] font-medium tabular-nums text-zinc-400"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <Icon className="size-4 shrink-0 text-zinc-400 opacity-90" strokeWidth={1.75} aria-hidden />
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
