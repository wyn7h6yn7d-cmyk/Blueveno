"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BluevenoLogoMark } from "@/components/brand/blueveno-logo-mark";
import { PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-[13px] font-medium tracking-[-0.012em] text-zinc-300 transition hover:text-zinc-50";

export function HomeNavigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[linear-gradient(180deg,oklch(0.06_0.055_266/0.92),oklch(0.045_0.05_272/0.82))] backdrop-blur-xl supports-[backdrop-filter]:bg-[oklch(0.055_0.055_266/0.72)]">
      <div className="mx-auto flex h-[4rem] max-w-[1320px] items-center justify-between px-5 sm:h-[4.35rem] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2.5 outline-none ring-offset-2 ring-offset-[oklch(0.06_0.05_268)] transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_252/0.85)]"
          onClick={() => setOpen(false)}
        >
          <BluevenoLogoMark className="size-6" />
          <span className="font-display text-[1.02rem] font-semibold tracking-[-0.04em] text-zinc-50">Blueveno</span>
        </Link>

        {/* Desktop — anchor links + auth; trial CTA on the right */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Marketing">
          <Link href="/#calendar" className={navLinkClass}>
            Calendar
          </Link>
          <Link href="/#pricing" className={navLinkClass}>
            Pricing
          </Link>
          <Link href="/login" className={cn(navLinkClass, "text-zinc-200")}>
            Sign in
          </Link>
          <PremiumPrimaryLink href="/signup" compact>
            Start 7-day trial
          </PremiumPrimaryLink>
        </nav>

        {/* Mobile trigger */}
        <div className="flex shrink-0 items-center lg:hidden">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-zinc-200 transition hover:bg-white/[0.08]"
            aria-expanded={open}
            aria-controls="home-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-[18px]" strokeWidth={2} /> : <Menu className="size-[18px]" strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div
          id="home-mobile-nav"
          className="border-t border-white/[0.06] bg-[linear-gradient(180deg,oklch(0.065_0.055_266/0.98),oklch(0.04_0.05_272/0.98))] px-5 py-5 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/#calendar"
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-100 transition hover:bg-white/[0.06]"
              onClick={() => setOpen(false)}
            >
              Calendar
            </Link>
            <Link
              href="/#pricing"
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-100 transition hover:bg-white/[0.06]"
              onClick={() => setOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-zinc-300 transition hover:bg-white/[0.06]"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <div className="mt-2 pt-2">
              <PremiumPrimaryLink href="/signup" className="w-full justify-center" onClick={() => setOpen(false)}>
                Start 7-day trial
              </PremiumPrimaryLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
