import "server-only";

import { createClient } from "@/lib/supabase/server";
import { resolveAccess } from "@/lib/access/resolve-access";
import type { AccessContext, UserProfileRow } from "@/lib/access/types";

function mapProfile(raw: Record<string, unknown>): UserProfileRow {
  return {
    user_id: String(raw.user_id),
    email: String(raw.email ?? ""),
    is_admin: Boolean(raw.is_admin),
    trial_ends_at: String(raw.trial_ends_at),
    manual_premium: Boolean(raw.manual_premium),
    premium_active: Boolean(raw.premium_active),
    stripe_customer_id: raw.stripe_customer_id != null ? String(raw.stripe_customer_id) : null,
    stripe_subscription_id: raw.stripe_subscription_id != null ? String(raw.stripe_subscription_id) : null,
    account_disabled: Boolean(raw.account_disabled),
    last_active_at: raw.last_active_at != null ? String(raw.last_active_at) : null,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

/**
 * Ensures a profile row exists, syncs fixed admin email, updates last_active_at, then resolves access.
 */
export async function loadAccessForUser(userId: string, sessionEmail: string | null): Promise<AccessContext | null> {
  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc("ensure_user_profile");
  if (!rpcError && rpcData != null && typeof rpcData === "object") {
    const raw = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return resolveAccess(mapProfile(raw as Record<string, unknown>), sessionEmail);
    }
  }

  const { data: row, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).maybeSingle();

  if (error || !row) {
    console.error("[loadAccessForUser]", rpcError?.message ?? error?.message ?? "no profile");
    return null;
  }

  return resolveAccess(mapProfile(row as unknown as Record<string, unknown>), sessionEmail);
}
