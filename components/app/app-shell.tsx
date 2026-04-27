"use client";

import Link from "next/link";
import { BluevenoWordmark } from "@/components/brand/blueveno-wordmark";
import { AccessProvider } from "@/components/access/access-provider";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import type { AccessContextClient } from "@/lib/access/types";

type AppShellProps = {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; timezone?: string | null };
  access: AccessContextClient;
};

export function AppShell({ children, user, access }: AppShellProps) {
  return (
    <AccessProvider value={access}>
      <div className="flex min-h-full bg-[linear-gradient(180deg,oklch(0.085_0.055_266),oklch(0.058_0.048_270)_54%,oklch(0.044_0.044_274)_100%)] text-zinc-100">
        <aside className="sticky top-0 z-30 hidden h-screen w-[17.25rem] shrink-0 flex-col border-r border-[oklch(0.58_0.09_252/0.28)] bg-[linear-gradient(180deg,oklch(0.14_0.045_262),oklch(0.092_0.038_266)_68%,oklch(0.078_0.034_270))] shadow-[inset_-1px_0_0_oklch(1_0_0_/0.06),24px_0_72px_-46px_oklch(0_0_0/0.88),0_0_72px_-40px_oklch(0.64_0.14_252/0.3)] lg:flex">
          <div className="flex h-[4.35rem] items-center border-b border-white/[0.08] px-5">
            <Link
              href="/app"
              className="group flex items-center gap-2 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary"
            >
              <BluevenoWordmark className="text-[1.12rem]" />
              <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                app
              </span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            <AppSidebarNav isAdmin={access.isAdmin} />
          </div>
          <AppSidebarFooter />
        </aside>

        <div className="flex min-h-full min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <AppTopbar user={user} canWriteJournal={access.canWriteJournal} isAdmin={access.isAdmin} />
          </div>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.065_262/0.34)_0%,transparent_36%)]" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.045]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-app-shell-key opacity-[0.62]" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[54%] bg-app-shell-floor opacity-[0.72]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.016]" aria-hidden />
            <WorkspaceGate>
              <div className="relative mx-auto min-h-full w-full max-w-[1420px] px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-11">
                {children}
              </div>
            </WorkspaceGate>
          </div>
        </div>
      </div>
    </AccessProvider>
  );
}
