import { auth } from "@/auth";
import Link from "next/link";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function ReviewsPage() {
  await auth();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Reviews"
        title="Day review"
        description="Review page stays empty until you add real journal entries and chart links."
        actions={
          <Link
            href="/app/journal#add"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Add first day
          </Link>
        }
      />

      <DashboardCard eyebrow="Premium empty state" title="No review items yet" description="Nothing synthetic is shown here.">
        <EmptyState
          icon={Camera}
          title="Paste your TradingView link"
          description="When you save a journal day with notes and a chart link, your day review timeline appears here automatically."
          action={
            <Link
              href="/app/journal#add"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Go to journal
            </Link>
          }
        />
      </DashboardCard>
    </div>
  );
}
