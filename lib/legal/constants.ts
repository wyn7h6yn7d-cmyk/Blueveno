import { BLUEVENO_SUPPORT_EMAIL } from "@/lib/access/access-messaging";
import { PRICING_EUR } from "@/lib/marketing/pricing-copy";

export { BLUEVENO_SUPPORT_EMAIL };

export const LEGAL_LAST_UPDATED = "May 2026";

export const LEGAL_PRODUCT_DISCLAIMER =
  "Blueveno is a journaling and review tool for your own trading activity. It does not provide financial advice, trading signals, or investment recommendations. You are solely responsible for your trading decisions, risk management, and outcomes.";

export const TRIAL_PREMIUM_SUMMARY = `New accounts receive a ${PRICING_EUR.trialDays}-day trial with one trading account and full write access. After the trial, your workspace becomes read-only until Premium is enabled. Premium unlocks ongoing journaling and up to five trading accounts. Paid checkout may be added later; access can also be granted by request.`;

export const LEGAL_NAV = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

export function supportMailto(subject?: string): string {
  const base = `mailto:${BLUEVENO_SUPPORT_EMAIL}`;
  if (!subject?.trim()) return base;
  return `${base}?subject=${encodeURIComponent(subject.trim())}`;
}

export const SUPPORT_REQUEST_MAILTO = supportMailto("Blueveno Support Request");
export const DELETION_REQUEST_MAILTO = supportMailto("Blueveno Account Deletion Request");
export const PREMIUM_REQUEST_MAILTO_LEGAL = supportMailto("Blueveno Premium Access Request");
