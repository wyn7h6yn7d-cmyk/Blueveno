"use client";

import Link from "next/link";
import { BarChart3, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useAccess } from "@/components/access/access-provider";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function CalendarPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Blueveno"
        title="Calendar"
        description="Your month at a glance — daily P&amp;L, week totals on the rail, and one tap into day detail."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/app/stats" className={appSecondaryCta}>
              <BarChart3 className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Stats
            </Link>
            <Link href="/app/journal#add" className={appPrimaryCta}>
              Log a day
            </Link>
          </div>
        }
      />

      {!ready ? (
        <DashboardCard eyebrow="Loading" title="Syncing your journal" description="Pulling entries from your workspace.">
          <div className="h-48 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard
          eyebrow="Start here"
          title="No days logged yet"
          description="Add your first trading day — this grid will light up with greens, reds, and week totals."
        >
          <EmptyState
            icon={CalendarDays}
            title="The calendar is waiting"
            description="One entry is enough to see your first week column and daily cell."
            action={
              <Link href="/app/journal#add" className={appPrimaryCta}>
                Log a day
              </Link>
            }
            className="border-none bg-transparent py-8 ring-0"
          />
        </DashboardCard>
      ) : (
        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,oklch(0.42_0.12_252/0.12),transparent_62%)] md:block"
            aria-hidden
          />
          <div className="relative">
            <PnlCalendar entries={data.journal} displayCurrency={displayCurrency} />
          </div>
        </div>
      )}
    </div>
  );
}
