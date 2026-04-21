import type { SupabaseClient } from "@supabase/supabase-js";

export function hasBearerSession(supabase: SupabaseClient) {
  return supabase.auth.getSession().then(({ data: { session } }) => Boolean(session?.access_token));
}

/**
 * After a full page load or hard navigation, the browser client may run before the
 * session is hydrated from cookies. PostgREST then carries no JWT and RLS returns no rows.
 */
export async function waitForSessionUser(
  supabase: SupabaseClient,
  userId: string,
  isCancelled: () => boolean,
): Promise<boolean> {
  for (let attempt = 0; attempt < 45; attempt++) {
    if (isCancelled()) return false;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    const tokenOk = await hasBearerSession(supabase);
    if (!error && user?.id === userId && tokenOk) return true;
    if (attempt === 8) {
      await supabase.auth.refreshSession().catch(() => undefined);
    }
    await new Promise((r) => setTimeout(r, 50 + Math.min(attempt, 20) * 20));
  }
  return false;
}
