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
        description="Review your saved days with notes and linked charts."
        actions={
          <Link href="/app/journal#add" className={outlineAction}>
            Log the day
          </Link>
        }
      />

      <DashboardCard eyebrow="Reviews" title="Nothing to review yet" description="Save the chart and note to build this view.">
        <EmptyState
          icon={Camera}
          title="Start with one reviewed day"
          description="Log the day and add a linked chart to unlock review flow."
          action={
            <Link href="/app/journal#add" className={outlineAction}>
              Log the day
            </Link>
          }
        />
      </DashboardCard>
    </div>
  );
}
