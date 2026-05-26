import type { SupabaseClient } from "@supabase/supabase-js";

const storageKey = (userId: string) => `bv_overview_onboarding_dismissed_${userId}`;

/** PostgREST / schema errors when the dismiss column or RPC is not deployed yet. */
export function isOverviewOnboardingSchemaError(message: string | undefined, code: string | undefined): boolean {
  const normalized = (message ?? "").toLowerCase();
  return (
    code === "PGRST202" ||
    code === "PGRST204" ||
    (normalized.includes("overview_onboarding") &&
      (normalized.includes("schema cache") ||
        normalized.includes("could not find") ||
        normalized.includes("does not exist") ||
        normalized.includes("column")))
  );
}

export function readOverviewOnboardingDismissedLocal(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(storageKey(userId)));
  } catch {
    return false;
  }
}

export function writeOverviewOnboardingDismissedLocal(userId: string, dismissedAt: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), dismissedAt);
  } catch {
    /* quota */
  }
}

export async function loadOverviewOnboardingDismissed(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const localDismissed = readOverviewOnboardingDismissedLocal(userId);

  const { data, error } = await supabase
    .from("user_profiles")
    .select("overview_onboarding_dismissed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!error) {
    const dbDismissed = Boolean(data?.overview_onboarding_dismissed_at);
    if (dbDismissed && data?.overview_onboarding_dismissed_at) {
      writeOverviewOnboardingDismissedLocal(userId, String(data.overview_onboarding_dismissed_at));
    }
    return dbDismissed || localDismissed;
  }

  if (!isOverviewOnboardingSchemaError(error.message, error.code)) {
    console.warn("[overview-onboarding] load preference:", error.message);
  }

  return localDismissed;
}

export type DismissOverviewOnboardingResult =
  | { ok: true; persisted: "database" | "local" }
  | { ok: false; message: string };

export async function dismissOverviewOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<DismissOverviewOnboardingResult> {
  const dismissedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ overview_onboarding_dismissed_at: dismissedAt, updated_at: dismissedAt })
    .eq("user_id", userId);

  if (!updateError) {
    writeOverviewOnboardingDismissedLocal(userId, dismissedAt);
    return { ok: true, persisted: "database" };
  }

  if (isOverviewOnboardingSchemaError(updateError.message, updateError.code)) {
    writeOverviewOnboardingDismissedLocal(userId, dismissedAt);
    return { ok: true, persisted: "local" };
  }

  const { error: rpcError } = await supabase.rpc("dismiss_overview_onboarding");
  if (!rpcError) {
    writeOverviewOnboardingDismissedLocal(userId, dismissedAt);
    return { ok: true, persisted: "database" };
  }

  if (isOverviewOnboardingSchemaError(rpcError.message, rpcError.code)) {
    writeOverviewOnboardingDismissedLocal(userId, dismissedAt);
    return { ok: true, persisted: "local" };
  }

  return { ok: false, message: rpcError.message || updateError.message };
}
