"use client";

import Link from "next/link";
import { BluevenoWordmark } from "@/components/brand/blueveno-wordmark";
import { AccessProvider } from "@/components/access/access-provider";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { TradingSessionStrip } from "@/components/app/trading-session-strip";
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
      <div className="flex min-h-full bg-[oklch(0.06_0.035_266)] text-zinc-100">
        <aside className="sticky top-0 z-30 hidden h-screen w-[16rem] shrink-0 flex-col border-r border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.105_0.03_264),oklch(0.085_0.032_266))] shadow-[inset_-1px_0_0_oklch(1_0_0_/0.04),18px_0_50px_-42px_oklch(0_0_0/0.8)] md:flex">
          <div className="flex h-[3.75rem] items-center border-b border-white/[0.08] px-4">
            <Link
              href="/app"
              className="group flex items-center gap-2 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary"
            >
              <BluevenoWordmark className="text-lg" />
              <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                app
              </span>
            </Link>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <AppSidebarNav isAdmin={access.isAdmin} />
          </div>
          <AppSidebarFooter />
        </aside>

        <div className="flex min-h-full min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-40 flex flex-col">
            <TradingSessionStrip serverTimeZone={user.timezone} />
            <AppTopbar user={user} canWriteJournal={access.canWriteJournal} isAdmin={access.isAdmin} />
          </div>
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.12_0.05_262/0.35)_0%,transparent_42%)]" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-app-shell-key" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-app-shell-floor" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.028]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.022]" aria-hidden />
            <WorkspaceGate>
              <div className="relative mx-auto min-h-full max-w-[1600px] px-3 py-5 sm:px-4 sm:py-7 md:px-7 md:py-9 lg:px-10">
                {children}
              </div>
            </WorkspaceGate>
          </div>
        </div>
      </div>
    </AccessProvider>
  );
}
