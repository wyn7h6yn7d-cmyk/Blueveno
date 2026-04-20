import type { AuthSession } from "@/types/auth-session";
import { hasFeature } from "@/lib/billing/entitlements";
import type { FeatureKey } from "@/lib/features";

/**
 * Server Actions / Route Handlers — throw before mutating data when the user lacks entitlement.
 * For page-level redirects, prefer `requireFeature` from `lib/billing/gate.server`.
 */
export function assertFeature(session: AuthSession | null, feature: FeatureKey): void {
  if (!hasFeature(session, feature)) {
    throw new Error(`forbidden:${feature}`);
  }
}
