import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { v2ModuleShell } from "@/lib/ui/v2-surface";

type LoadingBlockProps = {
  rows?: number;
  className?: string;
  variant?: "card" | "inline";
};

export function LoadingBlock({ rows = 3, className, variant = "card" }: LoadingBlockProps) {
  const content = (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "rounded-md bg-white/[0.05]",
            i === 0 ? "h-3 w-24" : i === rows - 1 ? "h-20 w-full" : "h-4 w-full",
          )}
        />
      ))}
    </div>
  );

  if (variant === "inline") {
    return <div className={className}>{content}</div>;
  }

  return <div className={cn(v2ModuleShell, "p-4 sm:p-5", className)}>{content}</div>;
}
