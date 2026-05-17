import type { Metadata } from "next";
import Link from "next/link";
import { LegalContactLink } from "@/components/legal/legal-contact-link";
import { LegalList, LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";
import { DELETION_REQUEST_MAILTO, TRIAL_PREMIUM_SUMMARY } from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Blueveno collects, uses, and protects your data. Journaling and review tool — not financial advice.",
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
    <LegalPageLayout
      currentPath="/privacy"
      title="Privacy Policy"
      intro="This policy explains what data Blueveno processes, why we process it, how long we keep it, and how you can access, correct, or delete your information."
    >
      <LegalSection title="1. What Blueveno is">
        <p>
          Blueveno is a personal trading journal and review workspace. You record your own sessions, link optional chart
          URLs, and review calendar and stats derived from your entries. Blueveno does not provide financial advice,
          trading signals, or investment recommendations.
        </p>
      </LegalSection>

      <LegalSection title="2. Data we store">
        <LegalList
          items={[
            <>
              <span className="font-medium text-zinc-200">Account and identity:</span> email, display name, timezone,
              display currency preference, authentication identifiers, and session data needed to sign in securely.
            </>,
            <>
              <span className="font-medium text-zinc-200">Journal and review data:</span> entry dates, symbols, P&amp;L
              amounts you enter, notes, mood and discipline fields, tags, weekly reflections, personal rules, and
              optional chart links you provide.
            </>,
            <>
              <span className="font-medium text-zinc-200">Trading accounts:</span> account names, types, currency, and
              related settings you configure in the app.
            </>,
            <>
              <span className="font-medium text-zinc-200">Access state:</span> trial status, premium or read-only access,
              and entitlement fields used to control what you can edit in the workspace.
            </>,
            <>
              <span className="font-medium text-zinc-200">Operations and security:</span> technical logs and error signals
              needed to keep the service reliable and secure.
            </>,
            <>
              <span className="font-medium text-zinc-200">Product analytics:</span> anonymous usage events (for example,
              opening Calendar or exporting a summary CSV). We do not send journal notes, P&amp;L values, symbols, or
              other trading content in analytics events. See our{" "}
              <Link href="/cookies" className="text-bv-ice/90 underline-offset-4 hover:underline">
                Cookie Policy
              </Link>{" "}
              for more detail.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Why we process data">
        <LegalList
          items={[
            "To create and secure your account.",
            "To provide journal, calendar, stats, and settings features.",
            "To enforce trial, Premium, and read-only access rules.",
            "To respond to support and deletion requests.",
            "To maintain platform safety and comply with legal obligations.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Trial and Premium access">
        <p>{TRIAL_PREMIUM_SUMMARY}</p>
        <p>
          Access state is stored so the app can show the correct limits (for example, read-only mode after trial). We do
          not store payment card details in the app today.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention">
        <p>
          We keep data for as long as your account is active and as needed to operate the service. If you request
          deletion, we remove or anonymize personal data unless we must retain specific records for security, dispute
          resolution, or legal compliance.
        </p>
      </LegalSection>

      <LegalSection title="6. Sharing">
        <p>
          We do not sell your personal data. Data is processed by infrastructure providers that host authentication,
          database storage, and the web application (for example, hosting and database services). They process data only
          on our instructions and as needed to run Blueveno.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          Depending on your location, you may have rights to access, correct, export, restrict, or delete your personal
          data, and to object to certain processing. Contact us using the email below and we will respond within a
          reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="8. Account deletion">
        <p>
          To request deletion, email us from the address tied to your account so we can verify ownership. Include
          &quot;Account deletion&quot; in the subject line or use this link:{" "}
          <a href={DELETION_REQUEST_MAILTO} className="text-bv-ice/90 underline-offset-4 hover:underline">
            Request account deletion
          </a>
          . Deletion removes your journal data and account access unless we must retain limited records for legal or
          security reasons.
        </p>
        <p>
          You can also open Settings → Data &amp; privacy in the app for export and deletion options where available.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Support and privacy requests: <LegalContactLink className="text-bv-ice/90 underline-offset-4 hover:underline" />.
        </p>
      </LegalSection>

      <LegalSection title="10. Updates">
        <p>
          We may update this policy as the product changes. The &quot;Last updated&quot; date at the top reflects the
          current version. Continued use after an update means you accept the revised policy, subject to applicable law.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
