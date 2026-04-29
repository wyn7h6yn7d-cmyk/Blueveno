import "server-only";

import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { resolveAccess } from "@/lib/access/resolve-access";
import type { UserProfileRow } from "@/lib/access/types";
import type { AdminUserListItem } from "@/lib/access/admin-types";
import { getStripe } from "@/lib/billing/stripe";

function mapProfile(raw: Record<string, unknown>): UserProfileRow {
  return {
    user_id: String(raw.user_id),
    email: String(raw.email ?? ""),
    display_name: raw.display_name != null ? String(raw.display_name) : null,
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
    internal_note: raw.internal_note != null ? String(raw.internal_note) : null,
    premium_granted_reason: raw.premium_granted_reason != null ? String(raw.premium_granted_reason) : null,
    premium_granted_at: raw.premium_granted_at != null ? String(raw.premium_granted_at) : null,
    premium_granted_by: raw.premium_granted_by != null ? String(raw.premium_granted_by) : null,
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
  const { data: accountRows } = await admin.from("trading_accounts").select("user_id");
  const { data: accountDetailsRows } = await admin
    .from("trading_accounts")
    .select("id,user_id,name,account_type,created_at")
    .order("created_at", { ascending: false });
  const accountCounts = new Map<string, number>();
  for (const r of accountRows ?? []) {
    const uid = String((r as { user_id: string }).user_id);
    accountCounts.set(uid, (accountCounts.get(uid) ?? 0) + 1);
  }
  const accountDetailsByUser = new Map<
    string,
    Array<{ id: string; name: string; account_type: string | null; created_at: string | null }>
  >();
  for (const row of accountDetailsRows ?? []) {
    const uid = String((row as { user_id: string }).user_id);
    const bucket = accountDetailsByUser.get(uid) ?? [];
    bucket.push({
      id: String((row as { id: string }).id),
      name: String((row as { name?: string | null }).name ?? "Account"),
      account_type: (row as { account_type?: string | null }).account_type ?? null,
      created_at: (row as { created_at?: string | null }).created_at ?? null,
    });
    accountDetailsByUser.set(uid, bucket);
  }
  const { data: latestRows } = await admin
    .from("journal_entries")
    .select("user_id, entry_date, symbol, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  const recentByUser = new Map<string, string[]>();
  for (const row of latestRows ?? []) {
    const uid = String((row as { user_id: string }).user_id);
    const current = recentByUser.get(uid) ?? [];
    if (current.length >= 3) continue;
    const entryDate = String((row as { entry_date?: string | null }).entry_date ?? "");
    const createdAt = String((row as { created_at?: string | null }).created_at ?? "");
    const symbol = String((row as { symbol?: string | null }).symbol ?? "");
    const day = entryDate || (createdAt ? createdAt.slice(0, 10) : "");
    current.push([day, symbol].filter(Boolean).join(" · "));
    recentByUser.set(uid, current);
  }

  const stripe = getStripe();
  const premiumEndsBySubscription = new Map<string, string | null>();
  const subscriptionIds = Array.from(
    new Set(
      (profiles as Record<string, unknown>[])
        .map((p) => p.stripe_subscription_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );

  if (stripe && subscriptionIds.length > 0) {
    await Promise.all(
      subscriptionIds.map(async (subscriptionId) => {
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const itemPeriodEnds = subscription.items.data
            .map((item) => item.current_period_end)
            .filter((value): value is number => Number.isFinite(value));
          const latestItemPeriodEnd = itemPeriodEnds.length > 0 ? Math.max(...itemPeriodEnds) : null;
          premiumEndsBySubscription.set(
            subscriptionId,
            latestItemPeriodEnd ? new Date(latestItemPeriodEnd * 1000).toISOString() : null,
          );
        } catch (error) {
          console.error("[listUsersForAdmin] failed to retrieve Stripe subscription", subscriptionId, error);
          premiumEndsBySubscription.set(subscriptionId, null);
        }
      }),
    );
  }

  return (profiles as Record<string, unknown>[]).map((p) => {
    const profile = mapProfile(p);
    const ctx = resolveAccess(profile, profile.email);
    const sub =
      ctx.state === "admin"
        ? "Included · admin"
        : profile.premium_active && profile.stripe_subscription_id
          ? "Active · subscription"
          : profile.premium_active
            ? "Active"
            : profile.manual_premium
              ? "Complimentary"
              : "None";
    return {
      user_id: profile.user_id,
      email: profile.email,
      display_name: profile.display_name,
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
      premium_ends_at: profile.stripe_subscription_id
        ? (premiumEndsBySubscription.get(profile.stripe_subscription_id) ?? null)
        : null,
      account_count: accountCounts.get(profile.user_id) ?? 0,
      recent_activity: recentByUser.get(profile.user_id) ?? [],
      trading_accounts: accountDetailsByUser.get(profile.user_id) ?? [],
      internal_note: profile.internal_note,
      premium_granted_reason: profile.premium_granted_reason,
      premium_granted_at: profile.premium_granted_at,
      premium_granted_by: profile.premium_granted_by,
    };
  });
}
