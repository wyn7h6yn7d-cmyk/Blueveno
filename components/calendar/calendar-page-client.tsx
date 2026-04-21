"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";

const outlineAction = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function CalendarPageClient({ userId, initialWorkspace }: Props) {
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Calendar"
        title="Month at a glance"
        description="Your signature view—daily P&amp;L, week totals on the rail, tap a day to jump to that journal."
        actions={
          <Link href="/app/journal#add" className={outlineAction}>
            Log a day
          </Link>
        }
      />

      {!ready ? (
        <DashboardCard eyebrow="Calendar" title="Loading" description="Syncing your journal…">
          <div className="h-40 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard eyebrow="Calendar" title="No days yet" description="Once you log days, this grid fills with color.">
          <EmptyState
            icon={CalendarDays}
            title="Start with one day"
            description="Add a trading day from the journal—weekly totals build from your entries."
            action={
              <Link href="/app/journal#add" className={outlineAction}>
                Log a day
              </Link>
            }
          />
        </DashboardCard>
      ) : (
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-x-4 -top-6 bottom-0 hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.42_0.12_252/0.14),transparent_65%)] md:block"
            aria-hidden
          />
          <div className="relative">
            <PnlCalendar entries={data.journal} />
          </div>
        </div>
      )}
    </div>
  );
}
