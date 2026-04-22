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
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionSummary[]>([]);

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
          <div className="relative">
            <PnlCalendar entries={data.journal} displayCurrency={displayCurrency} weeklyReflections={weeklyReflections} />
          </div>
        </div>
      )}
    </div>
  );
}
