import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { appContentWrap } from "@/lib/ui/app-surface";
import { v2PageCanvas } from "@/lib/ui/v2-surface";

type AppShellProps = {
  sidebar?: ReactNode;
  topBar?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

/**
 * V2 composable page shell for incremental page upgrades.
 * Does not replace the live `components/app/app-shell.tsx` — use inside existing layout when migrating pages.
 */
export function AppShell({ sidebar, topBar, children, className, contentClassName }: AppShellProps) {
  return (
    <div className={cn("flex min-h-full text-zinc-100", v2PageCanvas, className)}>
      {sidebar}
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        {topBar}
        <main className={cn("relative flex-1", appContentWrap, "px-3 py-5 sm:px-6 sm:py-7 md:px-8 lg:px-10", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
