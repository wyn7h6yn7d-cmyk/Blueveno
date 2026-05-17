import type { Metadata } from "next";
import Link from "next/link";
import { LegalContactLink } from "@/components/legal/legal-contact-link";
import { LegalList, LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";
import { TRIAL_PREMIUM_SUMMARY } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using Blueveno — a trading journal and review tool, not financial advice.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    url: "/terms",
    title: "Terms of Service — Blueveno",
    description: "Terms for using Blueveno.",
  },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      currentPath="/terms"
      title="Terms of Service"
      intro="These Terms govern your access to and use of Blueveno. By creating an account or using the service, you agree to these Terms."
    >
      <LegalSection title="1. The service">
        <p>
          Blueveno is a journaling and review tool for your own trading activity. It helps you log sessions, review
          discipline, inspect calendar summaries, and export your data. Blueveno is not a broker, exchange, signal
          service, or investment adviser.
        </p>
      </LegalSection>

      <LegalSection title="2. No financial advice">
        <LegalList
          items={[
            "Blueveno does not provide financial advice, trading signals, or investment recommendations.",
            "Nothing in the app, website, or support responses is a solicitation to buy or sell any instrument.",
            "You are solely responsible for your trading decisions, position sizing, risk management, and outcomes.",
            "Past journal entries or statistics do not guarantee future results.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Eligibility and account">
        <p>
          You must be old enough to form a binding contract in your jurisdiction. You are responsible for accurate
          registration information, keeping credentials secure, and all activity under your account. Notify us promptly if
          you suspect unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="4. Trial, Premium, and access">
        <p>{TRIAL_PREMIUM_SUMMARY}</p>
        <p>
          We may change trial length, pricing, or feature limits with reasonable notice where required. Premium may be
          enabled by request or through future in-app checkout when available.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <LegalList
          items={[
            "Do not misuse the service or attempt unauthorized access.",
            "Do not interfere with platform security or availability.",
            "Do not use Blueveno for unlawful purposes.",
            "Do not upload content that infringes others' rights or contains malware.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Your content">
        <p>
          You retain ownership of journal content and links you add. You grant Blueveno a limited license to host,
          process, back up, and display that content solely to operate the service for you.
        </p>
      </LegalSection>

      <LegalSection title="7. Privacy and cookies">
        <p>
          Our{" "}
          <Link href="/privacy" className="text-bv-ice/90 underline-offset-4 hover:underline">
            Privacy Policy
          </Link>{" "}
          explains what data we process and how to request deletion. Our{" "}
          <Link href="/cookies" className="text-bv-ice/90 underline-offset-4 hover:underline">
            Cookie Policy
          </Link>{" "}
          explains cookies, session storage, and analytics.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          The service is provided &quot;as is&quot; and &quot;as available.&quot; To the fullest extent permitted by law,
          Blueveno disclaims warranties of merchantability, fitness for a particular purpose, and non-infringement. We do
          not warrant uninterrupted or error-free operation.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Blueveno and its operators are not liable for indirect, incidental,
          special, consequential, or punitive damages, or for trading losses, lost profits, or lost data arising from
          your use of the service.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes and termination">
        <p>
          We may update these Terms or discontinue features. Material changes will be posted on this page. We may suspend
          or terminate accounts that violate these Terms or threaten platform integrity. You may stop using Blueveno at
          any time and request account deletion as described in the Privacy Policy.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these Terms:{" "}
          <LegalContactLink subject="Blueveno Terms Question" className="text-bv-ice/90 underline-offset-4 hover:underline" />
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
