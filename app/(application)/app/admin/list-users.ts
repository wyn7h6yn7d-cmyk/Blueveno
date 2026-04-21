import "server-only";

import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { resolveAccess } from "@/lib/access/resolve-access";
import type { UserProfileRow } from "@/lib/access/types";
import type { AdminUserListItem } from "@/lib/access/admin-types";

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

export async function listUsersForAdmin(): Promise<AdminUserListItem[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access?.isAdmin) {
    throw new Error("Forbidden");
  }

  if (!isSupabaseServiceRoleConfigured()) {
    console.error("[listUsersForAdmin] SUPABASE_SERVICE_ROLE_KEY missing");
    return [];
  }

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !profiles) {
    console.error("[listUsersForAdmin]", error?.message);
    return [];
  }

  const { data: journalRows } = await admin.from("journal_entries").select("user_id");
  const counts = new Map<string, number>();
  for (const r of journalRows ?? []) {
    const uid = String((r as { user_id: string }).user_id);
    counts.set(uid, (counts.get(uid) ?? 0) + 1);
  }

  return (profiles as Record<string, unknown>[]).map((p) => {
    const profile = mapProfile(p);
    const ctx = resolveAccess(profile, profile.email);
    const sub =
      ctx.state === "admin"
        ? "Admin (no billing)"
        : profile.premium_active
          ? "Stripe / active"
          : profile.manual_premium
            ? "Manual premium"
            : "None";
    return {
      user_id: profile.user_id,
      email: profile.email,
      is_admin: profile.is_admin,
      trial_ends_at: profile.trial_ends_at,
      manual_premium: profile.manual_premium,
      premium_active: profile.premium_active,
      account_disabled: profile.account_disabled,
      last_active_at: profile.last_active_at,
      created_at: profile.created_at,
      journal_entry_count: counts.get(profile.user_id) ?? 0,
      access_state: ctx.state,
      subscription_label: sub,
    };
  });
}
