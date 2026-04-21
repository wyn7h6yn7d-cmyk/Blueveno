"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

function GithubGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"
      />
    </svg>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type Provider = "google" | "github";

const btnClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-[0.65rem] border border-white/[0.1] bg-white/[0.05] font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-200 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] backdrop-blur-sm transition hover:border-white/[0.16] hover:bg-white/[0.09] disabled:pointer-events-none disabled:opacity-45";

type SocialOAuthButtonsProps = {
  /** Where to send the user after `/auth/callback` (same-origin path only). */
  redirectPath?: string;
};

export function SocialOAuthButtons({ redirectPath = "/app" }: SocialOAuthButtonsProps) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  async function signInWithProvider(provider: Provider) {
    setOauthError(null);
    if (!isSupabaseConfigured()) {
      setOauthError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }

    setPending(provider);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      setPending(null);
      setOauthError(error.message);
      return;
    }
    /* Browser follows redirect to provider; keep pending state until unload */
  }

  return (
    <div className="mt-9">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bv-surface/90 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={pending !== null}
          aria-busy={pending === "google"}
          onClick={() => void signInWithProvider("google")}
          className={cn(btnClass)}
        >
          <GoogleGlyph className="size-4 text-zinc-200" />
          Google
        </button>
        <button
          type="button"
          disabled={pending !== null}
          aria-busy={pending === "github"}
          onClick={() => void signInWithProvider("github")}
          className={cn(btnClass)}
        >
          <GithubGlyph className="size-4 text-zinc-200" />
          GitHub
        </button>
      </div>

      {oauthError ? (
        <p className="mt-3 rounded-[0.65rem] border border-red-500/25 bg-red-500/[0.08] px-3 py-2 text-center text-[12px] leading-relaxed text-red-100" role="alert">
          {oauthError}
        </p>
      ) : null}

      <p className="mt-3 text-center text-[10px] leading-relaxed text-zinc-600">
        Enable Google &amp; GitHub under Supabase → Authentication → Providers; use Supabase&apos;s callback URL in Google/GitHub apps. See{" "}
        <code className="rounded bg-white/[0.06] px-1 py-0.5 text-[9px] text-zinc-400">docs/OAUTH.md</code>.
      </p>
    </div>
  );
}
