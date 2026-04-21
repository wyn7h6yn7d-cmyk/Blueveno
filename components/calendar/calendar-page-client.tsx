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

type Props = {
  userId: string;
};

export function CalendarPageClient({ userId }: Props) {
  const { data, ready } = useUserWorkspace(userId);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Calendar"
        title="Daily & weekly P&L"
        description="A clean month view for scanning performance by day and week."
        actions={
          <Link
            href="/app/journal#add"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Add trading day
          </Link>
        }
      />

      {!ready ? (
        <DashboardCard eyebrow="Calendar" title="Loading" description="Preparing your performance calendar…">
          <div className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard eyebrow="Premium empty state" title="No trading days yet" description="Start simple, then scale.">
          <EmptyState
            icon={CalendarDays}
            title="Start tracking your week"
            description="Your calendar turns green and red automatically after your first entries. Weekly totals appear at the end of each row."
            action={
              <Link
                href="/app/journal#add"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
                )}
              >
                Add first entry
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
