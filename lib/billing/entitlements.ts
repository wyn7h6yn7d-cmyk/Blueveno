import type { Session } from "next-auth";

export type PlanTier = "free" | "pro" | "enterprise";

/**
 * Placeholder until subscriptions are persisted (Stripe + DB).
 * Later: load Subscription row by user id and map status → entitlements.
 */
export function getPlanTier(session: Session | null): PlanTier {
  if (!session?.user) {
    return "free";
  }
  return "free";
}

export function canAccessFullJournal(session: Session | null): boolean {
  return getPlanTier(session) !== "free" || process.env.NODE_ENV === "development";
}
