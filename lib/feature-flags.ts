/**
 * Feature flags (env-driven) — orthogonal to paid tiers.
 * Use for gradual rollout, kill switches, and beta surfaces.
 *
 * Convention: NEXT_PUBLIC_* for client-readable flags (build-time).
 * Server-only flags: no prefix — never import in client components.
 */

function truthy(v: string | undefined): boolean {
  return v === "1" || v?.toLowerCase() === "true";
}

/** AI surfaces gated by tier AND this flag until product-ready */
export function isAiInsightsFlagEnabled(): boolean {
  return truthy(process.env.FEATURE_AI_INSIGHTS);
}

/** Client-safe — must be NEXT_PUBLIC_ */
export function isMarketingPricingExperimentEnabled(): boolean {
  if (typeof process.env.NEXT_PUBLIC_FEATURE_ELITE_PRICING === "undefined") {
    return false;
  }
  return truthy(process.env.NEXT_PUBLIC_FEATURE_ELITE_PRICING);
}
