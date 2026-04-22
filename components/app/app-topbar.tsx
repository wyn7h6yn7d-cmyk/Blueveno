"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  Home,
  LogOut,
  Menu,
  NotebookPen,
  Settings,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";
import { WorkspaceSessionClock } from "@/components/app/workspace-session-clock";

type AppTopbarProps = {
  user: { name?: string | null; email?: string | null; timezone?: string | null };
  canWriteJournal?: boolean;
  isAdmin?: boolean;
};

function sectionLabel(pathname: string): string {
  if (pathname.startsWith("/app/admin")) return "Admin";
  if (pathname.startsWith("/app/stats")) return "Stats";
  if (pathname.startsWith("/app/calendar")) return "Calendar";
  if (pathname.startsWith("/app/journal")) return "Journal";
  if (pathname.startsWith("/app/settings/billing")) return "Billing";
  if (pathname.startsWith("/app/settings")) return "Settings";
  if (pathname.startsWith("/app/analytics")) return "Analytics";
  if (pathname.startsWith("/app/reviews")) return "Reviews";
  if (pathname.startsWith("/app/playbooks")) return "Playbooks";
  if (pathname === "/app" || pathname === "/app/") return "Overview";
  return "Workspace";
}

export function AppTopbar({ user, canWriteJournal = true, isAdmin = false }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const displayName = user.name?.trim() || user.email?.trim() || "Account";
  const fallbackInitial = displayName.charAt(0).toUpperCase() || "A";
  const label = sectionLabel(pathname);
  /** Greeting: profile display name when set, otherwise email (same source as Settings). */
  const helloName = user.name?.trim() || user.email?.trim() || "";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const startedAt = Date.now();
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
        setSigningOut(false);
        return;
      }
    } catch (e) {
      console.error(e);
      setSigningOut(false);
      return;
    }

    // Keep the sign-out state visible briefly to avoid a UI flash before route change.
    const minVisualMs = 900;
    const remaining = minVisualMs - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="flex h-[3.25rem] shrink-0 items-center gap-3 border-b border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.13_0.03_262/0.98),oklch(0.105_0.028_264/0.96))] px-3 shadow-[0_1px_0_0_oklch(1_0_0_/0.05)] backdrop-blur-xl md:h-16 md:gap-4 md:px-5">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "shrink-0 text-zinc-300 md:hidden",
          )}
          aria-label="Open navigation"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(100%,18rem)] border-white/[0.08] bg-bv-base p-0">
          <SheetHeader className="border-b border-white/[0.06] px-5 py-5 text-left">
            <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
              Blueveno
            </SheetTitle>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
          </SheetHeader>
          <div className="flex flex-col gap-1 p-3">
            <AppSidebarNav isAdmin={isAdmin} onNavigate={() => setMobileNavOpen(false)} />
            <AppSidebarFooter onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 items-stretch gap-2 sm:gap-4">
        <div className="min-w-0 shrink-0">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:block">Workspace</p>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 sm:gap-x-3">
            <p className="font-display truncate text-base font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:text-[1.0625rem]">
              {label}
            </p>
            <WorkspaceSessionClock serverTimeZone={user.timezone} />
          </div>
        </div>
        {helloName ? (
          <div className="hidden min-w-0 flex-1 flex-col justify-center sm:flex">
            <p
              className="truncate text-center text-[12px] leading-snug text-zinc-500 md:text-[13px]"
              title={helloName}
            >
              Hello,{" "}
              <span className="font-medium text-zinc-200">{helloName}</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-2.5 text-[13px] text-zinc-200 hover:bg-white/[0.07] sm:px-3.5",
          )}
          aria-label="Back to marketing home"
        >
          <Home className="size-4 opacity-90 sm:mr-1.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link
          href="/app/calendar"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "hidden min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-3.5 text-[13px] text-zinc-200 hover:bg-white/[0.07] md:inline-flex",
          )}
        >
          <CalendarDays className="mr-1.5 size-4 opacity-90" />
          Calendar
        </Link>
        <Link
          href="/app/journal#add"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-2.5 text-[13px] text-zinc-200 hover:bg-white/[0.07] sm:px-3.5",
            !canWriteJournal && "pointer-events-none opacity-40",
          )}
          aria-disabled={!canWriteJournal}
        >
          <NotebookPen className="size-4 opacity-90 sm:mr-1.5" />
          <span className="hidden sm:inline">New entry</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-2.5 text-[13px] text-zinc-200 hover:bg-white/[0.07] disabled:opacity-60 sm:px-3.5",
          )}
          aria-label="Sign out"
        >
          <LogOut className="size-4 opacity-90 sm:mr-1.5" strokeWidth={1.75} />
          <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Log out"}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "inline-flex shrink-0 items-center justify-center h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.04] p-0 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
            )}
            aria-label="Open account menu"
          >
            <span
              className="flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-[oklch(0.22_0.06_255)] text-xs font-semibold text-zinc-100"
              aria-hidden
            >
              {fallbackInitial}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-[13.75rem] rounded-xl border border-white/[0.09] bg-[oklch(0.125_0.028_262)] p-1.5 text-zinc-100 shadow-bv-float ring-1 ring-white/[0.04]"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2.5 py-2">
                <p className="truncate text-[13px] font-medium text-zinc-100">{displayName}</p>
                {user.email ? <p className="truncate text-xs text-zinc-500">{user.email}</p> : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
                onClick={() => router.push("/app/settings")}
              >
                <Settings className="size-4 text-zinc-400" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
