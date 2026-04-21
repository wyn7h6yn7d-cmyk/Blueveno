import type { AuthSession } from "@/types/auth-session";
import type { PlanTier } from "@/lib/billing/types";
import { createClient } from "@/lib/supabase/server";
import { isAdminFullAccessEmail } from "@/lib/billing/workspace-access";

function planFromEnv(): PlanTier | undefined {
  const o = process.env.BILLING_PLAN_TIER_OVERRIDE;
  if (o === "free" || o === "pro" || o === "elite") {
    return o;
  }
  return undefined;
}

/** Staging only: set `BILLING_TEST_FULL_ACCESS=true` to grant Elite to all signed-in users. */
function openTestTier(): PlanTier | undefined {
  return process.env.BILLING_TEST_FULL_ACCESS === "true" ? "elite" : undefined;
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

  const meta = user.user_metadata as {
    full_name?: string;
    name?: string;
    display_currency?: string;
  } | undefined;
  const name = meta?.name ?? meta?.full_name ?? user.email?.split("@")[0] ?? null;
  const displayCurrency = meta?.display_currency ?? null;

  let pt: PlanTier | undefined =
    planFromEnv() ?? openTestTier() ?? (isAdminFullAccessEmail(user.email) ? ("pro" as const) : undefined);

  if (!pt) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("trial_ends_at, manual_premium, premium_active, is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profile) {
      const row = profile as {
        trial_ends_at: string;
        manual_premium: boolean;
        premium_active: boolean;
        is_admin: boolean;
      };
      const premium = row.manual_premium || row.premium_active;
      const trialOk = new Date(row.trial_ends_at).getTime() > Date.now();
      if (row.is_admin || premium || trialOk) {
        pt = "pro";
      }
    }
  }

  return {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: user.id,
      email: user.email ?? "",
      name,
      planTier: pt,
      displayCurrency,
    },
  };
}
