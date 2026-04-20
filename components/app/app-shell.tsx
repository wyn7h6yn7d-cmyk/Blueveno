"use client";

import Link from "next/link";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";

type AppShellProps = {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex min-h-full bg-bv-void text-zinc-100">
      <aside className="sticky top-0 z-30 hidden h-screen w-[15.5rem] shrink-0 flex-col border-r border-white/[0.06] bg-[oklch(0.09_0.03_265/0.96)] shadow-[inset_-1px_0_0_oklch(1_0_0_/0.04)] backdrop-blur-xl md:flex">
        <div className="flex h-[3.75rem] items-center border-b border-white/[0.06] px-4">
          <Link
            href="/app"
            className="group flex items-center gap-2 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_250)]"
          >
            <span className="font-display text-lg font-medium tracking-tight text-zinc-50 transition group-hover:text-white">
              Blueveno
            </span>
            <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
              ws
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-3">
          <AppSidebarNav />
        </div>
        <AppSidebarFooter />
      </aside>

      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <AppTopbar user={user} />
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.11]" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-12%,oklch(0.42_0.14_250/0.14),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(ellipse_80%_70%_at_50%_100%,oklch(0.32_0.08_270/0.14),transparent_72%)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.22]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.12]" aria-hidden />
          <div className="relative mx-auto min-h-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
