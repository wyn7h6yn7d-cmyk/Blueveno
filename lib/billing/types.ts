/**
 * Subscription model — persisted row shape when Prisma + Stripe sync land.
 * Not stored yet; use getSubscriptionSnapshot() for the current placeholder.
 */
export type SubscriptionStatus =
  | "none"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

/** Ordered least → most capability. */
export type PlanTier = "free" | "pro" | "elite";

export type SubscriptionSnapshot = {
  tier: PlanTier;
  status: SubscriptionStatus;
  /** Stripe subscription id — null until Checkout completes */
  stripeSubscriptionId: string | null;
  /** Current period end — null if not active */
  currentPeriodEnd: Date | null;
  /** True when cancel_at_period_end is set in Stripe */
  cancelAtPeriodEnd: boolean;
};
