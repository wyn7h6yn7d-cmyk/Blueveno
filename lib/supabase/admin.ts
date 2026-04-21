import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

export function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

/** True when server can use the service role (required for /app/admin and admin server actions). */
export function isSupabaseServiceRoleConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getServiceRoleKey());
}

/** Service-role client for admin routes only. Never import from client components. */
export function createAdminClient() {
  const url = getSupabaseUrl();
  const key = getServiceRoleKey();
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
