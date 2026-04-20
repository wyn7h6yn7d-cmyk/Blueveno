import type { PlanTier } from "@/lib/billing/types";

/**
 * Product catalog — wire price IDs when Stripe Products/Prices exist.
 * Env keys are documented in docs/BILLING.md
 */
export type PlanDefinition = {
  id: PlanTier;
  /** Marketing slug for URLs */
  slug: string;
  name: string;
  /** Monthly display price — billing UI only */
  priceUsd: number | null;
  /** Env var holding Stripe Price id (price_...) */
  stripePriceEnvMonthly: string;
  stripePriceEnvYearly: string | null;
  /** Bullet list for pricing page */
  highlights: string[];
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: "free",
    slug: "free",
    name: "Free",
    priceUsd: 0,
    stripePriceEnvMonthly: "",
    stripePriceEnvYearly: null,
    highlights: [
      "Limited journal entries",
      "Core overview & basic stats",
      "Community support",
    ],
  },
  pro: {
    id: "pro",
    slug: "pro",
    name: "Pro",
    priceUsd: 29,
    stripePriceEnvMonthly: "STRIPE_PRICE_PRO_MONTHLY",
    stripePriceEnvYearly: "STRIPE_PRICE_PRO_YEARLY",
    highlights: [
      "Unlimited journal entries",
      "Advanced analytics & regime slices",
      "Screenshot review & session recaps",
      "Playbooks & rule tracking",
      "Priority support",
    ],
  },
  elite: {
    id: "elite",
    slug: "elite",
    name: "Elite",
    priceUsd: 79,
    stripePriceEnvMonthly: "STRIPE_PRICE_ELITE_MONTHLY",
    stripePriceEnvYearly: "STRIPE_PRICE_ELITE_YEARLY",
    highlights: [
      "Everything in Pro",
      "Premium PDF / export packs",
      "AI insights & narrative recap (when enabled)",
      "Desk & coach seats (future)",
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = ["free", "pro", "elite"];
