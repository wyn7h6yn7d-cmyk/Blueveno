import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Email confirmation / OAuth PKCE — Supabase redirects here with `?code=`.
 */
export async function GET(request: NextRequest) {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : `/${next}`}`);
}
