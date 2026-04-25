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
        These Terms govern access to and use of Blueveno. By creating an account or using the service, you agree to these
        Terms.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">1. Service scope</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        Blueveno provides journaling, review, and analytics tooling for trading performance. Blueveno is educational and
        operational software and does not provide investment, legal, tax, or financial advice.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">2. Account and security</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        You are responsible for keeping your credentials secure and for activity under your account. You must provide
        accurate information and notify us if you believe your account is compromised.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">3. Acceptable use</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        You agree not to misuse the service, interfere with platform security, attempt unauthorized access, reverse engineer
        protected systems, or use Blueveno for unlawful purposes.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">4. Data and content</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        You retain rights to your journal content and uploaded links. You grant Blueveno the limited rights necessary to
        host, process, and display your content to operate the service.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">5. Disclaimers and liability</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the maximum extent permitted by law, Blueveno
        disclaims warranties and is not liable for indirect, incidental, or consequential damages arising from your use of
        the service.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-100">6. Changes and termination</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
        We may update these Terms from time to time. Continued use after updates means acceptance of the revised Terms. We
        may suspend or terminate accounts that violate these Terms or threaten platform integrity.
      </p>

      <p className="mt-10 text-[15px] leading-relaxed text-zinc-400">
        Questions about these Terms:{" "}
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
