import Link from "next/link";
import type { ReactNode } from "react";
import { LogoLink } from "@/components/landing/LogoLink";

type AuthSplitLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
  /** Shown under Terms in development only */
  showDevHint?: boolean;
};

export function AuthSplitLayout({
  eyebrow,
  title,
  subtitle,
  children,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  showDevHint,
}: AuthSplitLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bv-void text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.22]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid-fine opacity-[0.12]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-hero-spotlight opacity-[0.55]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.18]" aria-hidden />
      <div
        className="pointer-events-none absolute -left-40 top-[15%] h-[min(520px,80vw)] w-[min(520px,80vw)] rounded-full bg-[oklch(0.42_0.14_250/0.14)] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full bg-[oklch(0.32_0.1_270/0.12)] blur-[90px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        <aside className="relative hidden flex-col justify-between border-r border-white/[0.06] bg-[oklch(0.06_0.03_265/0.5)] px-10 py-14 backdrop-blur-[2px] lg:flex xl:px-14">
          <div>
            <LogoLink className="group inline-flex items-center gap-2.5 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_250)]">
              <span className="font-display text-xl font-medium tracking-tight text-zinc-50 transition group-hover:text-zinc-100">
                Blueveno
              </span>
              <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                beta
              </span>
            </LogoLink>

            <p className="mt-14 font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
              {eyebrow}
            </p>
            <h1 className="font-display mt-5 max-w-lg text-[1.85rem] font-medium leading-[1.12] tracking-tight text-zinc-50 xl:text-[2.05rem]">
              {title}
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-zinc-400">{subtitle}</p>

            <div
              className="mt-12 rounded-xl border border-white/[0.07] bg-bv-surface-inset/60 p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
              aria-hidden
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Session · preview
              </p>
              <div className="mt-4 space-y-2 font-mono text-[11px] text-zinc-400">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">Ingest status</span>
                  <span className="text-[oklch(0.72_0.12_250)]">idle</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">Review queue</span>
                  <span className="tabular-nums text-zinc-300">0</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <p className="text-[10px] leading-relaxed text-zinc-600">
                  The same data model as production—no mock shortcuts in the ingest pipeline.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/[0.06] pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Trust</p>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              Encrypted sessions. Proprietary trading data stays yours—we do not sell behavioral
              signals or train models on your journal.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col border-white/[0.06] lg:border-l lg:bg-[oklch(0.08_0.03_265/0.35)] lg:backdrop-blur-sm">
          <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-8 lg:hidden">
            <LogoLink className="font-display text-lg font-medium tracking-tight text-zinc-50 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_250)]">
              Blueveno
            </LogoLink>
            <Link
              href="/"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
            >
              Home
            </Link>
          </header>

          <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
            <div className="mx-auto w-full max-w-[440px]">
              <div className="mb-9 lg:hidden">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[oklch(0.65_0.12_250)]">
                  {eyebrow}
                </p>
                <h2 className="font-display mt-3 text-2xl font-medium tracking-tight text-zinc-50">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{subtitle}</p>
              </div>

              {children}

              <p className="mt-9 text-center text-sm text-zinc-500">
                {alternatePrompt}{" "}
                <Link
                  href={alternateHref}
                  className="font-medium text-[oklch(0.78_0.12_250)] underline-offset-4 transition hover:text-[oklch(0.85_0.1_250)] hover:underline"
                >
                  {alternateLabel}
                </Link>
              </p>

              <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
                By continuing you agree to our{" "}
                <Link href="#" className="text-zinc-400 underline-offset-2 transition hover:text-zinc-300 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-zinc-400 underline-offset-2 transition hover:text-zinc-300 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {showDevHint ? (
                <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-zinc-600">
                  Developer: set{" "}
                  <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-zinc-400">
                    AUTH_DEMO=true
                  </code>{" "}
                  and use demo credentials from{" "}
                  <code className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-zinc-400">
                    .env
                  </code>
                  .
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
