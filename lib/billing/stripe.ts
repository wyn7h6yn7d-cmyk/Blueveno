import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

/**
 * Lazily construct Stripe client when STRIPE_SECRET_KEY is present.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripe) {
    stripe = new Stripe(key, {
      typescript: true,
    });
  }
  return stripe;
}
