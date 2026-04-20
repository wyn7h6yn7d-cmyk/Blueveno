import type { AuthSession } from "@/types/auth-session";
import type { PlanTier, SubscriptionSnapshot, SubscriptionStatus } from "@/lib/billing/types";

/**
 * Resolve effective tier for the session.
 *
 * Priority (later):
 * 1. session.user.planTier from JWT (set on login from DB)
 * 2. BILLING_PLAN_TIER_OVERRIDE for local/staging demos
 * 3. free
 */
export function getEffectivePlanTier(session: AuthSession | null): PlanTier {
  const fromSession = session?.user?.planTier;
  if (fromSession && isPlanTier(fromSession)) {
    return fromSession;
  }
  const envOverride = process.env.BILLING_PLAN_TIER_OVERRIDE;
  if (envOverride && isPlanTier(envOverride)) {
    return envOverride;
  }
  return "free";
}

function isPlanTier(v: string): v is PlanTier {
  return v === "free" || v === "pro" || v === "elite";
}

/**
 * Placeholder snapshot until Subscription table + Stripe webhooks populate fields.
 */
export function getSubscriptionSnapshot(session: AuthSession | null): SubscriptionSnapshot {
  const tier = getEffectivePlanTier(session);
  const hasPaid = tier !== "free";

  return {
    tier,
    status: hasPaid ? "active" : "none",
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };
}

/** Map Stripe status string (future) to our union */
export function normalizeStripeStatus(stripeStatus: string | undefined): SubscriptionStatus {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "none";
  }
}
