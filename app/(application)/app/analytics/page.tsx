import { auth } from "@/auth";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const outlineAction = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

export default async function AnalyticsPage() {
  await auth();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Analytics"
        title="Performance"
        description="Aggregates from your journal only—no demo or seeded curves."
        actions={
          <Link href="/app/journal#add" className={outlineAction}>
            New entry
          </Link>
        }
      />

      <DashboardCard>
        <EmptyState
          icon={BarChart3}
          title="Log trading days to see trends"
          description="Performance views stay empty until your journal has real days—nothing synthetic is shown."
          action={
            <Link href="/app/journal#add" className={outlineAction}>
              Open journal
            </Link>
          }
        />
      </DashboardCard>
    </div>
  );
}
