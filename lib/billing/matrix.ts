import type { PlanTier } from "@/lib/billing/types";
import type { FeatureKey } from "@/lib/features";

/** Numeric rank for tier comparisons — higher = more entitlements. */
export const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};

/**
 * Minimum tier required to unlock each feature.
 * Adjust when packaging changes — single source of truth for gating.
 */
export const MIN_TIER_FOR_FEATURE: Record<FeatureKey, PlanTier> = {
  "journal.unlimited": "pro",
  "analytics.advanced": "pro",
  "reviews.screenshot": "pro",
  "playbooks.full": "pro",
  "reports.premium": "elite",
  "ai.insights": "elite",
};

export function tierMeetsRequirement(userTier: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[required];
}

export function minTierForFeature(feature: FeatureKey): PlanTier {
  return MIN_TIER_FOR_FEATURE[feature];
}
