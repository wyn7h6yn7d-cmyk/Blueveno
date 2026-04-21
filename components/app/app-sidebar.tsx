"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/journal", label: "Journal", icon: BookOpen },
  { href: "/app/settings", label: "Settings", icon: Settings },
] as const;

type AppSidebarNavProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebarNav({ onNavigate, className }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-0.5", className)} aria-label="Workspace">
      <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Core workspace</p>
      {APP_NAV.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-[linear-gradient(135deg,oklch(0.2_0.06_252/0.7),oklch(0.16_0.04_260/0.75))] text-zinc-50 shadow-[inset_0_0_0_1px_oklch(0.62_0.1_252/0.28)]"
                : "text-zinc-400 hover:bg-white/[0.045] hover:text-zinc-100",
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
    </nav>
  );
}

export function AppSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  void onNavigate;

  return (
    <div className="border-t border-white/[0.06] p-3">
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Focus mode</p>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">Overview, Calendar, Journal, Settings. Nothing extra.</p>
      </div>
    </div>
  );
}
