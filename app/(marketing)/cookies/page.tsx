import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Blueveno uses cookies and similar storage.",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-24 text-zinc-100 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">Cookie Policy</h1>

      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        This policy explains how Blueveno uses cookies and similar browser storage, and how cookie preferences are handled.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">1. Essential cookies and session storage</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Blueveno uses essential cookies and session storage for authentication, session continuity, security, and core app
        behavior. These are required for sign-in and protected workspace access.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">2. Optional cookies (if enabled later)</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>
          <span className="font-medium text-zinc-200">Analytics cookies:</span> may be added in the future to understand
          product usage and improve reliability.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Marketing cookies:</span> may be added later for campaign measurement or
          marketing attribution.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">3. Managing preferences</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Blueveno currently uses essential authentication/session storage only. If non-essential cookies are added in the
        future, we will introduce consent controls so you can accept, reject, and change preferences at any time.
      </p>

      <p className="mt-10 text-[15px] leading-relaxed text-zinc-400">
        Questions about this policy can be sent to{" "}
        <a href="mailto:kennethalto95@gmail.com" className="text-bv-ice/90 underline-offset-4 hover:underline">
          kennethalto95@gmail.com
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
