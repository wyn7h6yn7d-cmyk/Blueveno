import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Blueveno.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-24 text-zinc-100 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        This is a concise placeholder for pre-launch review. A full terms document will be published before public billing.
        By using Blueveno you agree to use the product responsibly and accept that trading involves risk; the software is a
        performance tool, not investment advice.
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        For questions contact{" "}
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
