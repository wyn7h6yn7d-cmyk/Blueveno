import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KpiGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
};

const colClass: Record<NonNullable<KpiGridProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 xl:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
};

export function KpiGrid({ children, columns = 4, className }: KpiGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-3", colClass[columns], className)}>
      {children}
    </div>
  );
}
