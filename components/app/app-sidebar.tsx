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
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Workspace">
      <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
      {MAIN_NAV.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
              active
                ? "bg-[linear-gradient(135deg,oklch(0.19_0.055_252/0.72),oklch(0.15_0.04_260/0.78))] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.58_0.1_252/0.26)]"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0 transition-opacity",
                active ? "text-primary/90" : "text-zinc-500 group-hover:text-zinc-300",
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
            "group mt-1 flex min-h-10 items-center gap-3 rounded-lg border border-white/[0.07] px-3 py-2 text-[13px] transition-colors",
            ADMIN_NAV.match(pathname)
              ? "bg-[linear-gradient(135deg,oklch(0.22_0.06_252/0.75),oklch(0.14_0.045_260/0.82))] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.58_0.1_252/0.3)]"
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
  void onNavigate;

  return (
    <div className="border-t border-white/[0.06] p-3">
      <div
        className={cn(
          "rounded-lg border border-[oklch(0.52_0.12_252/0.28)] bg-[linear-gradient(165deg,oklch(0.14_0.05_262/0.55),oklch(0.08_0.04_268/0.5))]",
          "p-3.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]",
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
      </div>
    </div>
  );
}
