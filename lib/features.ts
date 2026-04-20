/**
 * Feature keys for Stripe / plan gating — keep in sync with billing entitlements.
 */
export const FEATURE_KEYS = [
  "journal.create",
  "analytics.advanced",
  "reviews.premium",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
