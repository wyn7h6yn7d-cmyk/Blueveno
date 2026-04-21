import { auth } from "@/auth";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
  await auth();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        description="No seeded metrics. Analytics activates after you log real trading days in your journal."
        actions={
          <Link
            href="/app/journal#add"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Add first journal entry
          </Link>
        }
      />

      <DashboardCard
        eyebrow="Premium empty state"
        title="No performance data yet"
        description="Intentional clean start for every account."
      >
        <EmptyState
          icon={BarChart3}
          title="No trading days yet"
          description="Log your first day, then this page will show only your own metrics. We never display fake analytics or demo performance values."
          action={
            <Link
              href="/app/journal#add"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Open journal
            </Link>
          }
        />
      </DashboardCard>
    </div>
  );
}
