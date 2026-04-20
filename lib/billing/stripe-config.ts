import "server-only";

/**
 * Read Stripe Price IDs from env — returns null if unset (Checkout not wired).
 * Use in future Checkout Session creation and Customer Portal.
 */
export function getStripePriceIdMonthly(plan: "pro" | "elite"): string | null {
  const key = plan === "pro" ? "STRIPE_PRICE_PRO_MONTHLY" : "STRIPE_PRICE_ELITE_MONTHLY";
  return process.env[key] ?? null;
}

export function getStripePriceIdYearly(plan: "pro" | "elite"): string | null {
  const key = plan === "pro" ? "STRIPE_PRICE_PRO_YEARLY" : "STRIPE_PRICE_ELITE_YEARLY";
  return process.env[key] ?? null;
}
