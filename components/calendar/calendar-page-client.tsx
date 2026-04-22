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
            className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden bg-[radial-gradient(ellipse_82%_58%_at_46%_0%,oklch(0.42_0.12_252/0.13),transparent_64%)] md:block"
            aria-hidden
          />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(17.5rem,0.58fr)] xl:items-start">
            <div className="xl:min-w-0">
              <PnlCalendar entries={data.journal} displayCurrency={displayCurrency} />
            </div>

            <DashboardCard
              eyebrow="Logging"
              title="Keep the month alive"
              description="Calendar is your signature surface — keep it sharp by logging each close."
              className="xl:sticky xl:top-6"
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Rhythm</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">
                    One entry per day keeps week totals and trend lines meaningful.
                  </p>
                </div>

                <div className="rounded-xl border border-[oklch(0.52_0.12_252/0.26)] bg-[linear-gradient(168deg,oklch(0.1_0.04_264/0.5),oklch(0.06_0.03_268/0.45))] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Quick actions</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/app/journal#add" className={appPrimaryCta}>
                      Log a day
                    </Link>
                    <Link href="/app/stats" className={appSecondaryCta}>
                      Review stats
                    </Link>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
}
