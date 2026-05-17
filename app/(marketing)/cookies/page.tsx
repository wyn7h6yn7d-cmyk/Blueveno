import type { Metadata } from "next";
import Link from "next/link";
import { LegalContactLink } from "@/components/legal/legal-contact-link";
import { LegalList, LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Blueveno uses cookies, session storage, and privacy-safe analytics.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    url: "/cookies",
    title: "Cookie Policy — Blueveno",
    description: "How Blueveno uses cookies and similar storage.",
  },
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      currentPath="/cookies"
      title="Cookie Policy"
      intro="This policy explains how Blueveno uses cookies and similar browser technologies, including authentication storage and product analytics."
    >
      <LegalSection title="1. What we use today">
        <LegalList
          items={[
            <>
              <span className="font-medium text-zinc-200">Essential cookies and session storage</span> — required for
              sign-in, session continuity, security, and core app behavior. These cannot be disabled while using the
              signed-in workspace.
            </>,
            <>
              <span className="font-medium text-zinc-200">Product analytics</span> — when the site is deployed on our
              hosting provider, we use Vercel Web Analytics for aggregated page views and privacy-safe product events
              (for example, which features are used). Analytics events do not include journal notes, P&amp;L values,
              symbols, or other trading content. See the{" "}
              <Link href="/privacy" className="text-bv-ice/90 underline-offset-4 hover:underline">
                Privacy Policy
              </Link>{" "}
              for more detail.
            </>,
            <>
              <span className="font-medium text-zinc-200">Local preference storage</span> — for example, cookie consent
              choices and UI preferences stored in your browser.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. What we do not use">
        <p>
          We do not use advertising or cross-site tracking cookies for Blueveno today. We do not sell data collected
          through cookies.
        </p>
      </LegalSection>

      <LegalSection title="3. Optional categories (consent banner)">
        <p>
          Where shown, our cookie banner lets you accept or adjust optional categories (such as third-party or marketing
          cookies) before they are enabled. Necessary cookies remain active so the site can function. You can reopen
          cookie settings from the banner when available.
        </p>
        <p>
          If optional marketing cookies are introduced later, we will update this policy and ask for consent where
          required by law.
        </p>
      </LegalSection>

      <LegalSection title="4. Managing cookies in your browser">
        <p>
          You can clear or block cookies in your browser settings. Blocking essential cookies may prevent sign-in or
          break protected areas of the app.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>
          Questions about cookies or analytics:{" "}
          <LegalContactLink subject="Blueveno Cookie Policy" className="text-bv-ice/90 underline-offset-4 hover:underline" />
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
