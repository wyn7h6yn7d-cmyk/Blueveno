import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { v2ModuleShell } from "@/lib/ui/v2-surface";

type CardSkeletonProps = {
  rows?: number;
  variant?: "default" | "metric" | "chart";
  className?: string;
};

export function CardSkeleton({ rows = 3, variant = "default", className }: CardSkeletonProps) {
  return (
    <div className={cn(v2ModuleShell, "p-4 sm:p-5", className)} aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-24 rounded-md bg-white/[0.06]" />
      {variant === "metric" ? (
        <>
          <Skeleton className="mt-3 h-8 w-28 rounded-md bg-white/[0.08]" />
          <Skeleton className="mt-2 h-3 w-16 rounded-md bg-white/[0.05]" />
        </>
      ) : variant === "chart" ? (
        <Skeleton className="mt-4 h-40 w-full rounded-lg bg-white/[0.05]" />
      ) : (
        <div className="mt-4 space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-md bg-white/[0.05]" />
          ))}
        </div>
      )}
    </div>
  );
}
