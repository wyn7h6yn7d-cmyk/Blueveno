import { auth } from "@/auth";
import Link from "next/link";
import { BookCopy } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const outlineAction = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

export default async function PlaybooksPage() {
  await auth();

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Playbooks"
        title="Strategy notes"
        description="Reserved for disciplined playbooks tied to your journal—empty until you want them."
        actions={
          <Link href="/app#add" className={outlineAction}>
            New entry
          </Link>
        }
      />

      <DashboardCard eyebrow="Playbooks" title="Not in this release" description="No templates or fake playbooks.">
        <EmptyState
          icon={BookCopy}
          title="Journal comes first"
          description="Strategy layers ship after core journaling—add real days, then this area can grow with your process."
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
