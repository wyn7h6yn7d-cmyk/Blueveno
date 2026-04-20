/**
 * Feature keys for entitlement checks — keep in sync with
 * `MIN_TIER_FOR_FEATURE` in `lib/billing/matrix.ts`.
 */
export const FEATURE_KEYS = [
  "journal.unlimited",
  "analytics.advanced",
  "reviews.screenshot",
  "playbooks.full",
  "reports.premium",
  "ai.insights",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
