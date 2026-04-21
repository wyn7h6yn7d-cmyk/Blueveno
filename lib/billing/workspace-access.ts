import type { AuthSession } from "@/types/auth-session";
import { getEffectivePlanTier } from "@/lib/billing/resolve";
import { PRICING_EUR } from "@/lib/marketing/pricing-copy";

/**
 * Permanent full access — not gated by billing. Keep in sync with product policy only.
 * Also enforced in `public.user_profiles` via `ensure_user_profile` + fixed email sync.
 */
export const ADMIN_FULL_ACCESS_EMAIL = "kennethalto95@gmail.com";

/** Public catalog price (monthly) — Stripe Prices should match for production checkout. */
export const BLUEVENO_PREMIUM_PRICE_EUR = PRICING_EUR.monthly;

export function isAdminFullAccessEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase().trim() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
}

/** Paid workspace (single product tier today: Pro). */
export function hasPaidWorkspacePlan(session: AuthSession | null): boolean {
  if (!session?.user) return false;
  const tier = getEffectivePlanTier(session);
  return tier === "pro" || tier === "elite";
}

/**
 * Full journal + calendar + workspace features.
 * Admin email always passes; otherwise requires Pro/Elite on the session.
 */
export function hasFullWorkspaceAccess(session: AuthSession | null): boolean {
  if (!session?.user) return false;
  if (isAdminFullAccessEmail(session.user.email)) return true;
  return hasPaidWorkspacePlan(session);
}
