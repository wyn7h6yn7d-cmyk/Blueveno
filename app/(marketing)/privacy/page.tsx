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
        This Privacy Policy explains what personal data Blueveno processes, why we process it, and what choices you have.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">1. Data we collect</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>
          <span className="font-medium text-zinc-200">Account data:</span> email and authentication identifiers needed to
          create and secure your account.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Product data:</span> journal entries, notes, tags, chart links, and
          related review metadata you submit.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Technical data:</span> basic logs and security signals required to keep
          the service stable and protected.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">2. Why we process data</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>To provide, maintain, and secure your workspace.</li>
        <li>To support core journal and review features.</li>
        <li>To detect abuse, fraud, and unauthorized access attempts.</li>
        <li>To comply with legal obligations where applicable.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">3. Data sharing</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Blueveno does not sell your personal data. Data may be processed by trusted infrastructure and service providers that
        support hosting, authentication, and operations, under contractual confidentiality and security obligations.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">4. Retention and security</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        We retain personal data only as long as needed for service delivery, legal obligations, and legitimate business
        needs. We apply reasonable technical and organizational safeguards to protect data against unauthorized access,
        disclosure, alteration, and loss.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">5. Your rights</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, or export your data, and
        to object to specific processing. You may also withdraw optional cookie consent via cookie settings.
      </p>

      <p className="mt-10 text-[15px] leading-relaxed text-zinc-400">
        Privacy requests and questions:{" "}
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
