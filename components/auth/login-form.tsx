"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthPlaceholder } from "@/components/auth/social-auth-placeholder";
import { authFieldClass, authLabelClass } from "@/lib/auth-field";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  callbackUrl: string;
  /** From `/login?error=` (auth callback or config failures) */
  initialError?: string | null;
};

function messageForAuthError(code: string | null | undefined): string | null {
  if (!code) return null;
  if (code === "config") return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.";
  if (code === "auth") return "That sign-in link is invalid or expired. Try signing in again.";
  return null;
}

export function LoginForm({ callbackUrl, initialError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => messageForAuthError(initialError));
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setPending(false);
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }

    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);

    if (signError) {
      setError(signError.message === "Invalid login credentials" ? "Invalid email or password." : signError.message);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-bv-surface/55 shadow-bv-float backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative px-6 pb-8 pt-7 sm:px-8 sm:pb-9 sm:pt-8">
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Credentials</p>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-zinc-500">
              Sign in with the email and password for your Supabase Auth account.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <fieldset className="space-y-6">
            <legend className="sr-only">Sign in with email and password</legend>

            <div className="space-y-2">
              <Label htmlFor="email" className={authLabelClass}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(authFieldClass)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password" className={authLabelClass}>
                  Password
                </Label>
                <span
                  className="cursor-not-allowed font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600"
                  title="Password recovery ships in a later release"
                >
                  Forgot?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={cn(authFieldClass)}
              />
            </div>

            {error ? (
              <p
                className="rounded-[0.65rem] border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2.5 text-[13px] leading-relaxed text-red-100"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-[0.65rem] text-[15px] font-medium tracking-wide shadow-bv-primary"
            >
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </fieldset>
        </form>

        <SocialAuthPlaceholder />
      </div>
    </div>
  );
}
