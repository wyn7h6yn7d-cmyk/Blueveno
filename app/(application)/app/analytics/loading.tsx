import { PageHeader } from "@/components/app/page-header";
import { PanelGrid, Panel } from "@/components/app/panel-grid";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Analytics" title="Performance" description="Loading analytics…" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-[oklch(0.11_0.025_265/0.6)] p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>
      <PanelGrid>
        <Panel span={7}>
          <div className="rounded-xl border border-white/[0.07] bg-[oklch(0.12_0.025_265/0.85)] p-5">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-8 h-40 w-full rounded-lg" />
          </div>
        </Panel>
        <Panel span={5}>
          <div className="rounded-xl border border-white/[0.07] bg-[oklch(0.12_0.025_265/0.85)] p-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="mt-6 h-24 w-full" />
          </div>
        </Panel>
      </PanelGrid>
    </div>
  );
}
