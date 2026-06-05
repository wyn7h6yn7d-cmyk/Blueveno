import Link from "next/link";
import { ShieldX } from "lucide-react";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import { SectionCard } from "@/components/v2/cards";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

export function AdminAccessDenied() {
  return (
    <div className="mx-auto max-w-2xl">
      <SectionCard contentClassName="p-0 sm:p-0">
        <EmptyStatePanel
          icon={ShieldX}
          title="Admin access required"
          description="This area is restricted to workspace administrators. If you need access, contact your account owner."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/app" className={cn(appSecondaryCta, "min-h-10 px-4")}>
                Return to overview
              </Link>
              <Link href="/app/settings" className={cn(appSecondaryCta, "min-h-10 px-4")}>
                Open settings
              </Link>
            </div>
          }
        />
      </SectionCard>
    </div>
  );
}
