"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useAccess } from "@/components/access/access-provider";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { appPrimaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

type WeeklyReflectionSummary = {
  weekStart: string;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
};

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function CalendarPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { accounts, activeAccountId } = useTradingAccountsWorkspace();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionSummary[]>([]);

  const referenceBalance =
    accounts.find((a) => a.id === activeAccountId)?.startingBalance ??
    accounts[0]?.startingBalance ??
    null;

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    const supabase = createClient();
    void (async () => {
      const { data: rows, error } = await supabase
        .from("weekly_reflections")
        .select("week_start, what_worked, what_slipped, next_week_focus")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (cancelled || error) return;
      setWeeklyReflections(
        (rows ?? []).map((row) => ({
          weekStart: String(row.week_start),
          whatWorked: row.what_worked ?? null,
          whatSlipped: row.what_slipped ?? null,
          nextWeekFocus: row.next_week_focus ?? null,
        })),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="space-y-10 pt-2">
      {!ready ? (
        <DashboardCard eyebrow="Loading" title="Preparing your calendar" description="Loading your latest journal days.">
          <div className="h-48 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard
          eyebrow="Start here"
          title="No days logged yet"
          description="Your month will fill as you log trading days."
        >
          <EmptyState
            icon={CalendarDays}
            title="Ready for your first week"
            description="Log the day. Save the chart. See the week."
            action={
              <Link href="/app/journal#add" className={appPrimaryCta}>
                Log the day
              </Link>
            }
            className="border-none bg-transparent py-8 ring-0"
          />
        </DashboardCard>
      ) : (
        <div className="relative md:-mx-8 lg:-mx-10">
          <div
            className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden bg-[radial-gradient(ellipse_82%_58%_at_46%_0%,oklch(0.42_0.12_252/0.13),transparent_64%)] md:block lg:-inset-x-8"
            aria-hidden
          />
          <div className="relative px-1 md:px-4 lg:px-6">
            <PnlCalendar
              entries={data.journal}
              displayCurrency={displayCurrency}
              referenceBalance={referenceBalance}
              weeklyReflections={weeklyReflections}
            />
          </div>
        </div>
      )}
    </div>
  );
}
