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
      <aside className="sticky top-0 z-30 hidden h-screen w-[15.5rem] shrink-0 flex-col border-r border-border/90 bg-bv-base shadow-[inset_-1px_0_0_oklch(1_0_0_/0.045)] md:flex">
        <div className="flex h-[3.75rem] items-center border-b border-border/80 px-4">
          <Link
            href="/app"
            className="group flex items-center gap-2 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary"
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
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.1]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-app-shell-key" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-app-shell-floor" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-scanlines opacity-[0.18]" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.1]" aria-hidden />
          <div className="relative mx-auto min-h-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
