import type { Metadata } from "next";
import Link from "next/link";
import { OpenCookieSettingsButton } from "@/components/legal/open-cookie-settings-button";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Blueveno.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-24 text-zinc-100 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">Cookie Policy</h1>

      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        This policy explains what cookies Blueveno uses, why we use them, and how you can control optional categories.
        Essential cookies are required to keep core features and security working.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">Cookie categories</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>
          <span className="font-medium text-zinc-200">Necessary cookies:</span> required for login state, security
          protections, and critical product functionality.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Third-party cookies:</span> optional cookies used for integrations or
          service performance analysis.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Marketing cookies:</span> optional cookies used for campaign and ad
          relevance measurement.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">Managing consent</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        You can accept all optional cookies or save selected categories in the cookie consent dialog. Your preference is
        stored on your device and can be changed at any time.
      </p>
      <div className="mt-5">
        <OpenCookieSettingsButton className="inline-flex min-h-[2.55rem] items-center justify-center rounded-full border border-white/[0.2] bg-white/[0.04] px-4 text-[13px] font-medium tracking-[-0.015em] text-zinc-100 transition hover:bg-white/[0.1]">
          Open cookie settings
        </OpenCookieSettingsButton>
      </div>

      <p className="mt-10 text-[15px] leading-relaxed text-zinc-400">
        Questions about this policy can be sent to{" "}
        <a href="mailto:hello@blueveno.com" className="text-bv-ice/90 underline-offset-4 hover:underline">
          hello@blueveno.com
        </a>
        .
      </p>

      <p className="mt-12">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
