import type { Session } from "next-auth";
import type { FeatureKey } from "@/lib/features";

export type PlanTier = "free" | "pro" | "enterprise";

/**
 * Placeholder until Stripe + DB — replace with Subscription row lookup.
 */
export function getPlanTier(session: Session | null): PlanTier {
  if (!session?.user) {
    return "free";
  }
  return "free";
}

/** Journal: creating new entries (Stripe gate target). */
export function canCreateJournalEntry(session: Session | null): boolean {
  const tier = getPlanTier(session);
  return tier !== "free" || process.env.NODE_ENV === "development";
}

/** Analytics: advanced dashboards / slices (Stripe gate target). */
export function canUseAdvancedAnalytics(session: Session | null): boolean {
  const tier = getPlanTier(session);
  return tier !== "free" || process.env.NODE_ENV === "development";
}

/** Reviews: premium review / annotation tooling (Stripe gate target). */
export function canUsePremiumReviews(session: Session | null): boolean {
  const tier = getPlanTier(session);
  return tier !== "free" || process.env.NODE_ENV === "development";
}

/**
 * Single entry point for server components / actions — extend when plans exist.
 */
export function hasFeature(session: Session | null, feature: FeatureKey): boolean {
  switch (feature) {
    case "journal.create":
      return canCreateJournalEntry(session);
    case "analytics.advanced":
      return canUseAdvancedAnalytics(session);
    case "reviews.premium":
      return canUsePremiumReviews(session);
    default:
      return false;
  }
}
