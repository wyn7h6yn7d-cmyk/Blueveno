import type { Session } from "next-auth";
import { hasFeature } from "@/lib/billing/entitlements";
import type { FeatureKey } from "@/lib/features";

/**
 * Server-side guard helpers — use in Server Actions / Route Handlers before mutations.
 */
export function assertFeature(session: Session | null, feature: FeatureKey): void {
  if (!hasFeature(session, feature)) {
    throw new Error(`forbidden:${feature}`);
  }
}
