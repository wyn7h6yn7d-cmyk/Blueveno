"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { AppSidebarFooter, AppSidebarNav } from "@/components/app/app-sidebar";

type AppTopbarProps = {
  user: { name?: string | null; email?: string | null };
};

export function AppTopbar({ user }: AppTopbarProps) {
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  void user;

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-bv-raised/82 px-3 backdrop-blur-xl supports-[backdrop-filter]:bg-bv-raised/72 md:h-[3.75rem] md:gap-4 md:px-5">
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
        <SheetContent side="left" className="w-[min(100%,18rem)] border-border/85 bg-bv-base p-0">
          <SheetHeader className="border-b border-border/80 px-4 py-4 text-left">
            <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
              Blueveno
            </SheetTitle>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Workspace</p>
          </SheetHeader>
          <div className="flex flex-col p-3">
            <AppSidebarNav onNavigate={() => setMobileNavOpen(false)} />
            <AppSidebarFooter onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative min-w-0 flex-1 md:max-w-md lg:max-w-lg">
        <label htmlFor="workspace-search" className="sr-only">
          Search workspace
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          strokeWidth={1.75}
          aria-hidden
        />
        <Input
          id="workspace-search"
          type="search"
          placeholder="Search trades, tags, sessions…"
          className="h-10 w-full rounded-xl border-white/[0.08] bg-bv-surface-inset/90 pl-10 pr-14 text-sm text-zinc-100 placeholder:text-zinc-600"
          autoComplete="off"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 lg:inline-flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto" />
    </header>
  );
}
