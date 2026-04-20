import { PageHeader } from "@/components/app/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Journal" title="Trade stream" description="Loading journal entries…" />
      <div className="rounded-xl border border-white/[0.07] bg-[oklch(0.12_0.025_265/0.85)] p-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-2 h-4 max-w-md" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
