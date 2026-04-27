import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Blueveno collects, uses, and protects your data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
    title: "Privacy Policy — Blueveno",
    description: "How Blueveno collects, uses, and protects your data.",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-background px-5 py-24 text-zinc-100 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Legal</p>
      <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-zinc-400">
        This Privacy Policy explains what data Blueveno processes, why it is processed, how long it is kept, and how you can
        request access, correction, or deletion.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">1. Data we process</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>
          <span className="font-medium text-zinc-200">Account and identity:</span> account ID, email, display name, timezone,
          and authentication/session data required to sign in securely.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Journal data:</span> journal entries, date/time, symbol, P&amp;L values,
          notes, mood/state, discipline checks (followed plan, respected stop, no revenge trade), and linked chart URLs.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Access and billing state:</span> trial status, premium/subscription access
          state, and related entitlement fields used to control write/read-only access.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Admin management data:</span> role flags, account status fields, and
          audit-relevant metadata needed to operate admin/user management.
        </li>
        <li>
          <span className="font-medium text-zinc-200">Security and operations:</span> basic logs and technical signals required
          to keep the service stable, available, and protected.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">2. Why we process data</h2>
      <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-zinc-400">
        <li>To provide and secure account access.</li>
        <li>To deliver journal, calendar, and stats features.</li>
        <li>To enforce trial/premium/read-only access rules.</li>
        <li>To support admin safety and abuse prevention.</li>
        <li>To comply with applicable legal obligations.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">3. Data retention</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        We keep data for as long as needed to operate your account and comply with legal obligations. If you request account
        deletion, we remove or anonymize personal data unless specific records must be retained for security, fraud
        prevention, or legal compliance.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">4. Data sharing</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Blueveno does not sell personal data. Data is processed by infrastructure providers needed to run authentication,
        storage, and hosting. Access is limited to what is required to provide the service.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">5. Your rights</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Depending on your jurisdiction, you may request access, correction, deletion, or restriction of your data.
        You may also object to certain processing where applicable.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">6. Deletion requests and contact</h2>
      <p className="mt-10 text-[15px] leading-relaxed text-zinc-400">
        For account deletion or support requests, contact us from your account email so we can verify ownership:{" "}
        <a href="mailto:kennethalto95@gmail.com" className="text-bv-ice/90 underline-offset-4 hover:underline">
          kennethalto95@gmail.com
        </a>
        .
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">7. Updates</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        We may update this policy as the product evolves. Material updates will be reflected on this page.
      </p>
      <p className="mt-12">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
