"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_NAV = [
  { href: "/app", label: "Journal", icon: BookOpen },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
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
      <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Navigate</p>
      {APP_NAV.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app" || pathname.startsWith("/app/journal")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
    </nav>
  );
}

export function AppSidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  void onNavigate;

  return (
    <div className="border-t border-white/[0.06] p-3">
      <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Blueveno</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">Journal, calendar, settings—lean scope by design.</p>
      </div>
    </div>
  );
}
