"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Settings,
  Shield,
} from "lucide-react";
import { BluevenoWordmark } from "@/components/brand/blueveno-wordmark";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/app" || p === "/app/" },
  { href: "/app/journal", label: "Journal", icon: BookOpen, match: (p: string) => p.startsWith("/app/journal") },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays, match: (p: string) => p.startsWith("/app/calendar") },
  { href: "/app/stats", label: "Stats", icon: BarChart3, match: (p: string) => p.startsWith("/app/stats") },
  { href: "/app/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/app/settings") && !p.startsWith("/app/settings/billing") },
  {
    href: "/app/settings/billing",
    label: "Billing",
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

  return (
    <nav className={cn("flex flex-col gap-1", className)} aria-label="Workspace">
      <p className="mb-2 px-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
      {MAIN_NAV.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
    <div className="border-t border-white/[0.06] p-4">
      <div
        className={cn(
          "rounded-xl border border-[oklch(0.52_0.12_252/0.3)] bg-[linear-gradient(165deg,oklch(0.16_0.06_262/0.62),oklch(0.09_0.04_268/0.58))]",
          "p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_16px_38px_-28px_oklch(0.62_0.15_252/0.52)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <BluevenoWordmark />
            <p className="mt-2.5 text-[12px] leading-relaxed text-zinc-500">Calendar · journal · stats</p>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.09] px-2 py-1 shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.08)]"
            title="Workspace session active"
            aria-label="Live — workspace session active"
          >
            <span
              className="bv-live-dot size-2 shrink-0 rounded-full bg-emerald-400"
              aria-hidden
            />
            <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-emerald-300/95">
              Live
            </span>
          </div>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
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
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          Blueveno is a journaling and review tool. It does not provide financial advice, trading signals, or investment
          recommendations.
        </p>
      </div>
    </div>
  );
}
