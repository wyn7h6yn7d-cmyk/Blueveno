import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getOverviewOnboardingDismissedForUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("overview_onboarding_dismissed_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data?.overview_onboarding_dismissed_at);
}
