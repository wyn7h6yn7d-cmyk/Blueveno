import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { FeatureKey } from "@/lib/features";
import { hasFeature } from "@/lib/billing/entitlements";

type RequireFeatureOptions = {
  /** Where to send users without access */
  redirectTo?: string;
};

/**
 * Server-only: use at the top of gated pages / layouts.
 * Redirects to pricing (or `redirectTo`) when the user lacks the feature.
 */
export async function requireFeature(feature: FeatureKey, options?: RequireFeatureOptions): Promise<void> {
  const session = await auth();
  const redirectTo = options?.redirectTo ?? "/pricing";
  if (!hasFeature(session, feature)) {
    redirect(redirectTo);
  }
}

/**
 * Same check without redirect — branch in the page for upgrade UI.
 */
export async function checkFeature(feature: FeatureKey): Promise<{ allowed: boolean }> {
  const session = await auth();
  return { allowed: hasFeature(session, feature) };
}
