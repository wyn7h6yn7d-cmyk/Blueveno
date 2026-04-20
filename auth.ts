import type { AuthSession } from "@/types/auth-session";
import type { PlanTier } from "@/lib/billing/types";
import { createClient } from "@/lib/supabase/server";

function planFromEnv(): PlanTier | undefined {
  const o = process.env.BILLING_PLAN_TIER_OVERRIDE;
  if (o === "free" || o === "pro" || o === "elite") {
    return o;
  }
  return undefined;
}

/**
 * Server-only session compatible with existing billing / `Session` types.
 * Backed by Supabase Auth (cookie session).
 */
export async function auth(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }

  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  const name = meta?.name ?? meta?.full_name ?? user.email?.split("@")[0] ?? null;
  const pt = planFromEnv();

  return {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: user.id,
      email: user.email ?? "",
      name,
      planTier: pt,
    },
  };
}
