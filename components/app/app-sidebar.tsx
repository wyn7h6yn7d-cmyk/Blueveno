"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { JOURNAL_ADD_ENTRY_HREF } from "@/lib/journal/journal-tab";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  LayoutDashboard,
  Rows3,
  Settings,
  Shield,
  TrendingUp,
} from "lucide-react";
import { BluevenoWordmark } from "@/components/brand/blueveno-wordmark";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/app" || p === "/app/" },
  { href: JOURNAL_ADD_ENTRY_HREF, label: "Journal", icon: BookOpen, match: (p: string) => p.startsWith("/app/journal") },
  { href: "/app/trades", label: "Trades", icon: Rows3, match: (p: string) => p.startsWith("/app/trades") },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays, match: (p: string) => p.startsWith("/app/calendar") },
  { href: "/app/stats", label: "Stats", icon: BarChart3, match: (p: string) => p.startsWith("/app/stats") },
  { href: "/app/reports", label: "Reports", icon: FileSpreadsheet, match: (p: string) => p.startsWith("/app/reports") },
  { href: "/app/capital", label: "Capital", icon: TrendingUp, match: (p: string) => p.startsWith("/app/capital") },
  { href: "/app/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/app/settings") && !p.startsWith("/app/settings/billing") },
  {
    href: "/app/settings/billing",
    label: "Plan & access",
    icon: CreditCard,
    match: (p: string) => p.startsWith("/app/settings/billing"),
  },
] as const;

const ADMIN_NAV = {
  href: "/app/admin",
  label: "Admin",
  icon: Shield,
  match: (p: string) => p.startsWith("/app/admin"),
} as const;

type AppSidebarNavProps = {
  isAdmin?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebarNav({ isAdmin = false, onNavigate, className }: AppSidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Workspace">
      <p className="app-kicker mb-2 px-3.5">Navigate</p>
      {MAIN_NAV.map((item) => {
        const active = item.match(pathname);
        const isJournal = item.href === JOURNAL_ADD_ENTRY_HREF;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => {
              if (isJournal) {
                e.preventDefault();
                router.push(JOURNAL_ADD_ENTRY_HREF);
              }
              onNavigate?.();
            }}
            className={cn(
              "group relative flex min-h-[2.8rem] items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] transition-colors",
              active
                ? "bg-[linear-gradient(135deg,oklch(0.23_0.07_252/0.78),oklch(0.16_0.045_260/0.85))] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.62_0.12_252/0.4),0_12px_30px_-20px_oklch(0.58_0.14_252/0.52)]"
                : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-100",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-[1.55rem] w-1 -translate-y-1/2 rounded-r-full bg-[oklch(0.72_0.14_252)]"
              />
            ) : null}
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-opacity",
                active ? "text-[oklch(0.8_0.1_252)]" : "text-zinc-500 group-hover:text-zinc-300",
              )}
              strokeWidth={1.75}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href={ADMIN_NAV.href}
          onClick={onNavigate}
          className={cn(
            "group mt-2 flex min-h-[2.8rem] items-center gap-3 rounded-xl border border-white/[0.08] px-3.5 py-2.5 text-[13px] transition-colors",
            ADMIN_NAV.match(pathname)
              ? "bg-[linear-gradient(135deg,oklch(0.23_0.07_252/0.78),oklch(0.14_0.045_260/0.84))] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.62_0.12_252/0.34)]"
              : "text-zinc-300 hover:bg-white/[0.05] hover:text-zinc-50",
          )}
        >
          <ADMIN_NAV.icon
            className={cn(
              "size-4 shrink-0",
              ADMIN_NAV.match(pathname) ? "text-amber-200/90" : "text-zinc-500 group-hover:text-zinc-300",
            )}
            strokeWidth={1.75}
          />
          <span className="truncate">{ADMIN_NAV.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function AppSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t border-white/[0.06] px-4 pb-3 pt-2.5">
      <div
        className={cn(
          "rounded-lg border border-white/[0.07] bg-[linear-gradient(165deg,oklch(0.13_0.04_264/0.56),oklch(0.09_0.03_268/0.52))]",
          "p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 opacity-90">
            <BluevenoWordmark className="text-[0.95rem]" />
          </div>
          <div
            className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-1.5 py-0.5"
            title="Workspace session active"
            aria-label="Live — workspace session active"
          >
            <span
              className="bv-live-dot size-1.5 shrink-0 rounded-full bg-emerald-400"
              aria-hidden
            />
            <span className="text-[11px] font-medium text-emerald-300/90">Live</span>
          </div>
        </div>
        <div className="app-kicker mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Link href="/privacy" onClick={onNavigate} className="transition hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/terms" onClick={onNavigate} className="transition hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/cookies" onClick={onNavigate} className="transition hover:text-zinc-300">
            Cookies
          </Link>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
          Journaling and review tool only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
