import { auth } from "@/auth";
import Link from "next/link";
import { BookCopy } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PlaybooksPage() {
  await auth();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Playbooks"
        title="Strategy notes"
        description="Playbooks are intentionally empty in the MVP until you add real journal days."
        actions={
          <Link
            href="/app/journal#add"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 rounded-xl border-white/[0.1] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.06]",
            )}
          >
            Add journal entry
          </Link>
        }
      />

      <DashboardCard
        eyebrow="Premium empty state"
        title="No strategy notes yet"
        description="No templates, no mock playbooks, no synthetic adherence scores."
      >
        <EmptyState
          icon={BookCopy}
          title="Start tracking your week"
          description="Build your process from real entries only. Add trading days first, then strategy notes can be layered in cleanly."
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
