"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";

const outlineAction = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

type Props = {
  userId: string;
};

export function CalendarPageClient({ userId }: Props) {
  const { data, ready } = useUserWorkspace(userId);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Calendar"
        title="Daily & weekly P&amp;L"
        description="Month grid with day tones and per-week totals. Tap a day to open its journal record."
        actions={
          <Link href="/app/journal#add" className={outlineAction}>
            New entry
          </Link>
        }
      />

      {!ready ? (
        <DashboardCard eyebrow="Calendar" title="Loading" description="Fetching your journal…">
          <div className="h-32 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard eyebrow="Calendar" title="No days yet" description="Once you log days, this view comes alive.">
          <EmptyState
            icon={CalendarDays}
            title="Your month view is empty"
            description="Add a trading day in the journal—colors and weekly totals derive from your entries only."
            action={
              <Link href="/app/journal#add" className={outlineAction}>
                New entry
              </Link>
            }
          />
        </DashboardCard>
      ) : (
        <PnlCalendar entries={data.journal} />
      )}
    </div>
  );
}
