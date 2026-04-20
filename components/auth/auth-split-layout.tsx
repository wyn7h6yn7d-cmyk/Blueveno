import Link from "next/link";
import type { ReactNode } from "react";
import { AuthWorkspacePreview } from "@/components/auth/auth-workspace-preview";
import { LogoLink } from "@/components/landing/LogoLink";
import { MarketingBackground } from "@/components/landing/MarketingBackground";

type AuthSplitLayoutProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
  variant?: "login" | "signup";
  /** Shown under Terms in development only */
  showDevHint?: boolean;
};

const specItems = ["Journal", "Analytics", "Review", "Accountability"];

export function AuthSplitLayout({
  eyebrow,
  title,
  subtitle,
  children,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  variant = "login",
  showDevHint,
}: AuthSplitLayoutProps) {
  return (
    <MarketingBackground>
      <main className="relative z-10 min-h-screen text-zinc-100">
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-rail-v opacity-70 lg:block" aria-hidden />

        <div className="mx-auto grid min-h-screen max-w-[1320px] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]">
          <aside className="relative hidden flex-col justify-between border-r border-white/[0.06] bg-bv-base/30 px-12 py-16 backdrop-blur-[1px] lg:flex xl:px-16 xl:py-20">
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent" aria-hidden />

            <div>
              <LogoLink className="group inline-flex items-center gap-2.5 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary">
                <span className="font-display text-xl font-medium tracking-tight text-zinc-50 transition group-hover:text-zinc-100">
                  Blueveno
                </span>
                <span className="rounded border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                  beta
                </span>
              </LogoLink>

              <p className="mt-16 font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">
                {eyebrow}
              </p>
              <h1 className="font-display mt-5 max-w-[26rem] text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] text-zinc-50 xl:text-[2.2rem]">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-zinc-500">{subtitle}</p>

              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {specItems.join(" · ")}
              </p>

              <div className="mt-14 max-w-lg">
                <AuthWorkspacePreview variant={variant} />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/[0.06] pt-12">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                Data posture
              </p>
              <p className="max-w-md text-sm leading-relaxed text-zinc-500">
                Encrypted sessions. Your tape and journal entries are not sold or used to train
                third-party models—this is operator software, not an audience product.
              </p>
            </div>
          </aside>

          <div className="relative flex min-h-screen flex-col border-white/[0.06] lg:border-l lg:bg-gradient-to-br lg:from-bv-raised/40 lg:via-bv-surface/25 lg:to-bv-void/80 lg:backdrop-blur-[2px]">
            <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5 sm:px-10 lg:border-transparent lg:bg-transparent lg:px-12 lg:pt-14">
              <LogoLink className="font-display text-lg font-medium tracking-tight text-zinc-50 outline-none ring-offset-2 ring-offset-bv-void focus-visible:ring-2 focus-visible:ring-primary lg:hidden">
                Blueveno
              </LogoLink>
              <div className="ml-auto flex items-center gap-6">
                <Link
                  href="/"
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition hover:text-zinc-300"
                >
                  Product
                </Link>
              </div>
            </header>

            <div className="flex flex-1 flex-col justify-center px-6 pb-16 pt-6 sm:px-10 lg:px-14 lg:pb-20 lg:pt-4 xl:px-16">
              <div className="mx-auto w-full max-w-[440px]">
                <div className="mb-10 lg:hidden">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bv-eyebrow">
                    {eyebrow}
                  </p>
                  <div className="font-display mt-4 text-[1.65rem] font-medium leading-[1.1] tracking-[-0.03em] text-zinc-50">
                    {title}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">{subtitle}</p>
                </div>

                {children}

                <p className="mt-10 text-center text-[14px] text-zinc-500">
                  {alternatePrompt}{" "}
                  <Link
                    href={alternateHref}
                    className="font-medium text-bv-ice/90 underline-offset-[6px] transition hover:text-primary hover:underline"
                  >
                    {alternateLabel}
                  </Link>
                </p>

                <p className="mt-8 text-center text-[11px] leading-relaxed text-zinc-600">
                  By continuing you agree to our{" "}
                  <Link
                    href="#"
                    className="text-zinc-500 underline-offset-2 transition hover:text-zinc-400 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-zinc-500 underline-offset-2 transition hover:text-zinc-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>

                {showDevHint ? (
                  <p className="mt-5 text-center font-mono text-[10px] leading-relaxed text-zinc-600">
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
    </MarketingBackground>
  );
}
