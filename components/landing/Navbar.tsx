"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { LogoLink } from "@/components/landing/LogoLink";

const anchorLinks = [
  { href: "#outcomes", label: "Outcomes" },
  { href: "#platform", label: "Platform" },
  { href: "#workflow", label: "Workflow" },
  { href: "#traders", label: "Traders" },
  { href: "#faq", label: "FAQ" },
];

const topLinks = [{ href: "/pricing", label: "Pricing" }];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.075_0.03_265/0.82)] shadow-[inset_0_-1px_0_0_oklch(1_0_0_/0.04)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[oklch(0.075_0.03_265/0.68)]">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <LogoLink className="group flex items-center gap-2.5 outline-none ring-offset-2 ring-offset-bv-void focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_250)]">
          <span className="font-display text-lg font-medium tracking-tight text-zinc-50 transition group-hover:text-zinc-100">
            Blueveno
          </span>
          <span className="hidden rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:inline">
            beta
          </span>
        </LogoLink>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
          {anchorLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
            >
              {l.label}
            </a>
          ))}
          {topLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {status === "authenticated" ? (
            <Link
              href="/app"
              className="hidden rounded-full border border-[oklch(0.55_0.14_250/0.38)] bg-[oklch(0.42_0.1_250/0.14)] px-4 py-2 text-[13px] text-[oklch(0.84_0.08_250)] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition hover:bg-[oklch(0.45_0.1_250/0.2)] sm:inline-flex"
            >
              Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="hidden rounded-full px-3 py-2 text-[13px] text-zinc-400 transition hover:text-zinc-100 sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="hidden rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-[13px] text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.07] sm:inline-flex"
              >
                Sign in
              </Link>
            </>
          )}
          <a
            href="#cta"
            className="hidden rounded-full border border-[oklch(0.55_0.14_250/0.28)] bg-[oklch(0.38_0.1_250/0.12)] px-4 py-2 text-[13px] text-[oklch(0.88_0.06_250)] transition hover:border-[oklch(0.55_0.14_250/0.45)] hover:bg-[oklch(0.42_0.12_250/0.16)] xl:inline-flex"
          >
            Request access
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-300 transition hover:border-white/[0.14] lg:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/[0.06] bg-[oklch(0.07_0.03_265)] px-5 py-5 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-3">
            {anchorLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {topLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={session ? "/app" : "/login"}
              className="mt-2 rounded-full bg-[oklch(0.72_0.14_250)] px-4 py-2.5 text-center text-sm font-semibold text-[oklch(0.12_0.04_265)]"
              onClick={() => setOpen(false)}
            >
              {session ? "Workspace" : "Sign in"}
            </Link>
            <a
              href="#cta"
              className="rounded-full border border-white/[0.1] px-4 py-2.5 text-center text-sm text-zinc-300"
              onClick={() => setOpen(false)}
            >
              Request access
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
