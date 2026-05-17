"use client";

import Link from "next/link";
import { BluevenoWordmark } from "@/components/brand/blueveno-wordmark";
import { AccessProvider } from "@/components/access/access-provider";
import { TradingAccountsProvider } from "@/components/trading-accounts/trading-accounts-provider";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { WorkspaceGate } from "@/components/app/workspace-gate";
import type { AccessContextClient } from "@/lib/access/types";
import { appContentWrap } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  user: { id: string; name?: string | null; email?: string | null; timezone?: string | null };
  access: AccessContextClient;
};

export function AppShell({ children, user, access }: AppShellProps) {
  const accessLabel = access.isAdmin
    ? "Admin"
    : access.state === "premium_active"
      ? "Premium"
      : access.state === "trial_active"
        ? "Trial"
        : "Read-only";

  return (
    <AccessProvider value={access}>
      <TradingAccountsProvider userId={user.id}>
        <div className="flex min-h-full bg-[linear-gradient(180deg,oklch(0.085_0.055_266),oklch(0.058_0.048_270)_54%,oklch(0.044_0.044_274)_100%)] text-zinc-100">
          <aside className="sticky top-0 z-30 hidden h-screen w-[17.25rem] shrink-0 flex-col border-r border-[oklch(0.58_0.09_252/0.28)] bg-[linear-gradient(180deg,oklch(0.14_0.045_262),oklch(0.092_0.038_266)_68%,oklch(0.078_0.034_270))] shadow-[inset_-1px_0_0_oklch(1_0_0_/0.06),24px_0_72px_-46px_oklch(0_0_0/0.88),0_0_72px_-40px_oklch(0.64_0.14_252/0.3)] lg:flex">
          <div className="flex h-[4.35rem] items-center border-b border-white/[0.08] px-5">
            <Link
              href="/app"
              className="group flex items-center gap-2 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary"
            >
              <BluevenoWordmark className="text-[1.12rem]" />
              <span className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
                App
              </span>
            </Link>
          </div>
          <div className="px-5 pt-2.5">
            <div
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/35 bg-[linear-gradient(180deg,oklch(0.22_0.09_160/0.45),oklch(0.16_0.08_160/0.34))] px-2.5 py-1 shadow-[0_0_20px_-9px_rgba(52,211,153,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              title="Current workspace access state"
            >
              <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.95)]" aria-hidden />
              <span className="text-[12px] font-medium text-emerald-100">{accessLabel}</span>
            </div>
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
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.065_262/0.24)_0%,transparent_34%)]" />
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.03]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-app-shell-key opacity-[0.48]" aria-hidden />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-app-shell-floor opacity-[0.56]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.012]" aria-hidden />
            <WorkspaceGate>
              <div className={cn("relative min-h-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-9 lg:px-10 lg:py-10", appContentWrap)}>
                {children}
              </div>
            </WorkspaceGate>
          </div>
        </div>
      </div>
      </TradingAccountsProvider>
    </AccessProvider>
  );
}
