import { auth } from "@/auth";
import Link from "next/link";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const outlineAction = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

export default async function ReviewsPage() {
  await auth();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Reviews"
        title="Day review"
        description="A place for chart-backed reviews once journal days include links and notes."
        actions={
          <Link href="/app#add" className={outlineAction}>
            New entry
          </Link>
        }
      />

      <DashboardCard eyebrow="Reviews" title="Nothing to review yet" description="Journal entries with charts drive this view.">
        <EmptyState
          icon={Camera}
          title="Save days with chart links"
          description="Journal days that include a TradingView URL and notes will surface here in a future iteration."
          action={
            <Link href="/app#add" className={outlineAction}>
              Open journal
            </Link>
          }
        />
      </DashboardCard>
    </div>
  );
}
