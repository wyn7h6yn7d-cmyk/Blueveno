"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Menu,
  NotebookPen,
  Settings,
  LogOut,
  Home,
  Wallet,
  X,
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
import { useTradingAccounts } from "@/lib/trading-accounts/use-trading-accounts";

type AppTopbarProps = {
  user: { id: string; name?: string | null; email?: string | null; timezone?: string | null };
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
  const {
    accounts,
    activeAccountId,
    error: accountLoadError,
    setActiveAccount,
  } = useTradingAccounts(user.id);
  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;
  const [accountActionError, setAccountActionError] = useState<string | null>(null);
  const [accountErrorDismissed, setAccountErrorDismissed] = useState(false);

  const accountErrorMessage = (() => {
    if (accountErrorDismissed) return null;
    const raw = accountActionError ?? accountLoadError;
    if (!raw) return null;
    const normalized = raw.toLowerCase();
    const missingTradingAccountsTable =
      normalized.includes("trading_accounts") &&
      (normalized.includes("could not find the table") ||
        normalized.includes("relation") ||
        normalized.includes("does not exist"));
    if (missingTradingAccountsTable) {
      return "Trading accounts are not set up in this environment yet. Run the latest Supabase migration and reload.";
    }
    return raw;
  })();

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
    <header className="flex min-h-[3.6rem] shrink-0 items-center gap-2 border-b border-white/[0.1] bg-[linear-gradient(180deg,oklch(0.155_0.045_262/0.98),oklch(0.118_0.034_264/0.97))] px-3 shadow-[0_1px_0_0_oklch(1_0_0_/0.07),0_20px_42px_-30px_oklch(0_0_0/0.84)] backdrop-blur-xl sm:gap-3 sm:px-4 md:min-h-[4.15rem] md:gap-4 md:px-6">
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

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-4">
        <div className="min-w-0 flex-1 overflow-hidden pr-1">
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 sm:block">Workspace</p>
          <div className="mt-0.5 flex min-w-0 flex-col items-start gap-1 sm:mt-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1.5">
            <p className="font-display w-full min-w-0 truncate text-[1.03rem] font-semibold leading-tight tracking-[-0.02em] text-zinc-50 sm:w-auto sm:text-[1.14rem]">
              {label}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className="inline-flex h-8 min-w-0 max-w-[18.5rem] items-center gap-1.5 rounded-full border border-[oklch(0.58_0.11_252/0.36)] bg-[oklch(0.14_0.045_262/0.88)] px-3 text-[12px] text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
              >
                <Wallet className="size-3.5 shrink-0 text-[oklch(0.74_0.11_252)]" />
                <span className="truncate">{activeAccount?.name ?? "Select account"}</span>
                {activeAccount ? (
                  <span className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.12em] text-emerald-200">
                    Active
                  </span>
                ) : null}
                <ChevronDown className="size-3.5 shrink-0 text-zinc-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="min-w-[15rem] rounded-xl border border-white/[0.09] bg-[oklch(0.125_0.028_262)] p-1.5 text-zinc-100 shadow-bv-float ring-1 ring-white/[0.04]"
              >
                <DropdownMenuLabel className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  Trading accounts
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <DropdownMenuItem
                      key={account.id}
                      className={cn(
                        "cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]",
                        activeAccountId === account.id && "bg-white/[0.06]",
                      )}
                      onClick={async () => {
                        setAccountErrorDismissed(false);
                        setAccountActionError(null);
                        const result = await setActiveAccount(account.id);
                        if (result.ok) {
                          router.refresh();
                          return;
                        }
                        setAccountActionError(result.error);
                      }}
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <span className="truncate">{account.name}</span>
                        {activeAccountId === account.id ? (
                          <span className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.12em] text-emerald-200">
                            Active
                          </span>
                        ) : null}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2.5 py-2 text-[12px] text-zinc-500">No accounts yet.</div>
                )}
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
                  onClick={() => router.push("/app/settings?section=accounts&new=1#accounts")}
                >
                  Create account
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
                  onClick={() => router.push("/app/settings?section=accounts#accounts")}
                >
                  Manage accounts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="min-w-0 max-w-full">
              <WorkspaceSessionClock serverTimeZone={user.timezone} />
            </div>
            {accountErrorMessage ? (
              <div className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/[0.14] px-2.5 py-1 text-[11px] text-rose-100 sm:max-w-[30rem] sm:text-[12px]">
                <span className="truncate">{accountErrorMessage}</span>
                <button
                  type="button"
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-rose-200/90 transition hover:bg-rose-500/25 hover:text-rose-100"
                  onClick={() => setAccountErrorDismissed(true)}
                  aria-label="Dismiss account error"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {helloName ? (
        <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 lg:flex">
          <p
            className="max-w-[34vw] truncate text-center text-[12px] leading-snug text-zinc-500 md:text-[13px]"
            title={helloName}
          >
            Hello,{" "}
            <span className="font-medium text-zinc-200">{helloName}</span>
          </p>
        </div>
      ) : null}

      <div className="relative z-10 flex shrink-0 items-center justify-end gap-1.5 sm:gap-2">
        <Link
          href="/app/journal#add"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "min-h-10 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.67_0.15_252))] px-2.5 text-[13px] font-semibold text-[oklch(0.1_0.04_265)] shadow-[0_14px_36px_-16px_oklch(0.43_0.14_252/0.62)] hover:brightness-[1.04] sm:px-3.5",
            !canWriteJournal && "pointer-events-none opacity-40",
          )}
          aria-disabled={!canWriteJournal}
        >
          <NotebookPen className="size-4 opacity-90 sm:mr-1.5" />
          <span className="hidden sm:inline">New entry</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.045] p-0 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
            )}
            aria-label="Open account menu"
          >
            <span
              className="flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-[oklch(0.24_0.065_255)] text-xs font-semibold text-zinc-100"
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
                onClick={() => router.push("/app/calendar")}
              >
                <CalendarDays className="size-4 text-zinc-400" />
                Calendar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
                onClick={() => router.push("/")}
              >
                <Home className="size-4 text-zinc-400" />
                Home page
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-zinc-200 outline-none focus-visible:bg-white/[0.06]"
                onClick={() => router.push("/app/settings")}
              >
                <Settings className="size-4 text-zinc-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200 outline-none focus-visible:bg-rose-500/[0.2]"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
              >
                <LogOut className="size-4 text-rose-300" />
                {signingOut ? "Signing out…" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
