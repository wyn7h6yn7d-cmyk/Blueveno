"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { createAdminClient, isSupabaseServiceRoleConfigured } from "@/lib/supabase/admin";
import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";

async function requireAdmin() {
  if (!isSupabaseServiceRoleConfigured()) {
    throw new Error("Admin tools are not available on this deployment.");
  }
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access?.isAdmin) {
    throw new Error("Forbidden");
  }
  return session;
}

function revalidateAdmin() {
  revalidatePath("/app/admin");
}

function isPrimaryAdminEmail(email: string): boolean {
  return email.toLowerCase().trim() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
}

async function assertOwnerNotTarget(adminUserId: string, targetUserId: string, reason: string) {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("user_profiles")
    .select("email,user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const email = String(row?.email ?? "");
  const isOwner = isPrimaryAdminEmail(email);
  if (isOwner) {
    throw new Error("Owner account is protected.");
  }
  if (adminUserId === targetUserId && reason === "remove_admin") {
    throw new Error("You cannot remove your own admin role.");
  }
}

export async function grantPremium(userId: string) {
  const session = await requireAdmin();
  await assertOwnerNotTarget(session.user.id, userId, "grant_premium");
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({
      manual_premium: true,
      premium_active: true,
      premium_granted_at: new Date().toISOString(),
      premium_granted_by: session.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function revokePremium(userId: string) {
  const session = await requireAdmin();
  await assertOwnerNotTarget(session.user.id, userId, "revoke_premium");
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({
      manual_premium: false,
      premium_active: false,
      premium_granted_reason: null,
      premium_granted_at: null,
      premium_granted_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function extendTrialDays(userId: string, days: number) {
  const session = await requireAdmin();
  await assertOwnerNotTarget(session.user.id, userId, "extend_trial");
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    throw new Error("Invalid days.");
  }
  const admin = createAdminClient();
  const { data: profile } = await admin.from("user_profiles").select("trial_ends_at").eq("user_id", userId).maybeSingle();
  const current = profile?.trial_ends_at ? new Date(String(profile.trial_ends_at)) : new Date();
  const base = Number.isNaN(current.getTime()) ? new Date() : current;
  const next = new Date(Math.max(base.getTime(), Date.now()));
  next.setDate(next.getDate() + Math.floor(days));
  const { error } = await admin
    .from("user_profiles")
    .update({ trial_ends_at: next.toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function makeAdmin(userId: string) {
  const session = await requireAdmin();
  await assertOwnerNotTarget(session.user.id, userId, "make_admin");
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ is_admin: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function removeAdmin(userId: string) {
  const session = await requireAdmin();
  await assertOwnerNotTarget(session.user.id, userId, "remove_admin");
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ is_admin: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function setAccountDisabled(userId: string, disabled: boolean) {
  const session = await requireAdmin();
  if (disabled) {
    await assertOwnerNotTarget(session.user.id, userId, "disable_account");
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ account_disabled: disabled, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function saveAdminUserNotes(input: {
  userId: string;
  internalNote?: string;
  premiumGrantedReason?: string;
}) {
  const session = await requireAdmin();
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    internal_note: (input.internalNote ?? "").trim() || null,
    premium_granted_reason: (input.premiumGrantedReason ?? "").trim() || null,
    updated_at: now,
  };
  if (patch.premium_granted_reason) {
    patch.premium_granted_at = now;
    patch.premium_granted_by = session.user.id;
  }
  const { error } = await admin.from("user_profiles").update(patch).eq("user_id", input.userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}
