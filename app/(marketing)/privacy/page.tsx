import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Blueveno.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-24 text-zinc-100 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        Blueveno is built as operator software: your journal and session data are meant to stay yours. Authentication is
        handled via Supabase; review your project&apos;s data processing settings for your deployment.
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        This page is a pre-launch summary. A detailed policy will be linked here before billing goes live.
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        Contact:{" "}
        <a href="mailto:hello@blueveno.com" className="text-bv-ice/90 underline-offset-4 hover:underline">
          hello@blueveno.com
        </a>
      </p>
      <p className="mt-12">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
