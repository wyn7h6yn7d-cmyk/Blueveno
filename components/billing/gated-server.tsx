import { auth } from "@/auth";
import type { FeatureKey } from "@/lib/features";
import { hasFeature } from "@/lib/billing/entitlements";
import type { ReactNode } from "react";

type GatedServerProps = {
  feature: FeatureKey;
  children: ReactNode;
  fallback: ReactNode;
};

/**
 * Server Component — renders `children` only if the session has the feature.
 * Use for hiding premium sections while still rendering the rest of the page.
 */
export async function GatedServer({ feature, children, fallback }: GatedServerProps) {
  const session = await auth();
  if (!hasFeature(session, feature)) {
    return fallback;
  }
  return children;
}
