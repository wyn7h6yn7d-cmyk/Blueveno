"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

const links = [
  { href: "#outcomes", label: "Outcomes" },
  { href: "#platform", label: "Platform" },
  { href: "#workflow", label: "Workflow" },
  { href: "#traders", label: "Traders" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-lg font-medium tracking-tight text-zinc-100">
            Blueveno
          </span>
          <span className="hidden rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:inline">
            beta
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {status === "authenticated" ? (
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary/15 sm:inline-flex"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-sm text-zinc-200 transition hover:border-white/[0.18] hover:bg-white/[0.06] sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <a
            href="#cta"
            className="hidden rounded-full border border-white/[0.1] px-4 py-2 text-sm text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.04] lg:inline-flex"
          >
            Request access
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-300 md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
        <div className="border-t border-white/[0.06] bg-[#050507]/95 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-zinc-300"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href={session ? "/dashboard" : "/login"}
              className="mt-2 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              {session ? "Dashboard" : "Sign in"}
            </Link>
            <a
              href="#cta"
              className="rounded-full border border-white/[0.12] px-4 py-2.5 text-center text-sm text-zinc-300"
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
