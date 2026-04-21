"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { loadAccessForUser } from "@/lib/access/load-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";

async function requireAdmin() {
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

export async function grantPremium(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ manual_premium: true, premium_active: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function revokePremium(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: row } = await admin.from("user_profiles").select("email").eq("user_id", userId).maybeSingle();
  const email = String(row?.email ?? "").toLowerCase();
  if (email === ADMIN_FULL_ACCESS_EMAIL.toLowerCase()) {
    throw new Error("Cannot revoke premium for the primary admin account.");
  }
  const { error } = await admin
    .from("user_profiles")
    .update({ manual_premium: false, premium_active: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function extendTrialDays(userId: string, days: number) {
  await requireAdmin();
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
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_profiles")
    .update({ is_admin: true, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function removeAdmin(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: row } = await admin.from("user_profiles").select("email").eq("user_id", userId).maybeSingle();
  const email = String(row?.email ?? "").toLowerCase();
  if (email === ADMIN_FULL_ACCESS_EMAIL.toLowerCase()) {
    throw new Error("Cannot remove primary admin.");
  }
  const { error } = await admin
    .from("user_profiles")
    .update({ is_admin: false, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function setAccountDisabled(userId: string, disabled: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: row } = await admin.from("user_profiles").select("email").eq("user_id", userId).maybeSingle();
  const email = String(row?.email ?? "").toLowerCase();
  if (email === ADMIN_FULL_ACCESS_EMAIL.toLowerCase() && disabled) {
    throw new Error("Cannot disable primary admin.");
  }
  const { error } = await admin
    .from("user_profiles")
    .update({ account_disabled: disabled, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidateAdmin();
}
