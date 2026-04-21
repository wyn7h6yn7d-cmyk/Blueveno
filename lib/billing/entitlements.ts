import type { AuthSession } from "@/types/auth-session";
import type { FeatureKey } from "@/lib/features";
import type { PlanTier } from "@/lib/billing/types";
import { MIN_TIER_FOR_FEATURE, tierMeetsRequirement } from "@/lib/billing/matrix";
import { getEffectivePlanTier } from "@/lib/billing/resolve";
import { hasFullWorkspaceAccess } from "@/lib/billing/workspace-access";

/**
 * @deprecated Use getEffectivePlanTier — kept for existing imports.
 */
export function getPlanTier(session: AuthSession | null): PlanTier {
  return getEffectivePlanTier(session);
}

function devUnrestricted(): boolean {
  return process.env.NODE_ENV === "development" && process.env.BILLING_STRICT !== "true";
}

/**
 * Core entitlement check — server components, actions, API routes.
 */
export function hasFeature(session: AuthSession | null, feature: FeatureKey): boolean {
  if (devUnrestricted()) {
    return true;
  }
  if (!hasFullWorkspaceAccess(session)) {
    return false;
  }
  const userTier = getEffectivePlanTier(session);
  const required = MIN_TIER_FOR_FEATURE[feature];
  return tierMeetsRequirement(userTier, required);
}

/** Convenience — journal without limits */
export function canUseUnlimitedJournal(session: AuthSession | null): boolean {
  return hasFeature(session, "journal.unlimited");
}

export function canUseAdvancedAnalytics(session: AuthSession | null): boolean {
  return hasFeature(session, "analytics.advanced");
}

export function canUseScreenshotReview(session: AuthSession | null): boolean {
  return hasFeature(session, "reviews.screenshot");
}

export function canUsePlaybooks(session: AuthSession | null): boolean {
  return hasFeature(session, "playbooks.full");
}

export function canUsePremiumReports(session: AuthSession | null): boolean {
  return hasFeature(session, "reports.premium");
}

export function canUseAiInsights(session: AuthSession | null): boolean {
  return hasFeature(session, "ai.insights");
}
