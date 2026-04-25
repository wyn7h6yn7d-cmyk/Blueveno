"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authFieldClass, authLabelClass } from "@/lib/auth-field";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptedLegal) {
      setIsError(true);
      setMessage("You must accept the Terms and Privacy Policy to create an account.");
      return;
    }

    setPending(true);

    if (!isSupabaseConfigured()) {
      setPending(false);
      setIsError(true);
      setMessage("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    setPending(false);

    if (error) {
      setIsError(true);
      setMessage(error.message);
      return;
    }

    if (data.user && !data.session) {
      setIsError(false);
      setMessage("Check your email to confirm your account, then sign in.");
      return;
    }

    if (data.session) {
      router.replace("/app");
      router.refresh();
      return;
    }

    setIsError(false);
    setMessage("Account created. You can sign in.");
  }

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-bv-surface/55 shadow-bv-float backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative px-6 pb-8 pt-7 sm:px-8 sm:pb-9 sm:pt-8">
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">New workspace</p>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-zinc-500">
              Creates a user in Supabase Auth. If email confirmation is on in your project, you&apos;ll confirm before
              signing in.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <fieldset className="space-y-6">
            <legend className="sr-only">Create account with email and password</legend>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className={authLabelClass}>
                Work email
              </Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@desk.com"
                className={cn(authFieldClass)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className={authLabelClass}>
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className={cn(authFieldClass)}
              />
              <p className="text-[11px] leading-relaxed text-zinc-600">
                Minimum eight characters. A password manager is recommended.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password" className={authLabelClass}>
                Confirm password
              </Label>
              <Input
                id="signup-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Repeat your password"
                className={cn(authFieldClass)}
              />
            </div>

            <label className="flex items-start gap-3 rounded-[0.65rem] border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-zinc-300">
              <input
                type="checkbox"
                checked={acceptedLegal}
                onChange={(e) => setAcceptedLegal(e.target.checked)}
                required
                className="mt-0.5 size-4 accent-[oklch(0.62_0.15_252)]"
              />
              <span>
                I agree to the{" "}
                <a href="/terms" className="underline underline-offset-4 hover:text-zinc-100">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-4 hover:text-zinc-100">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {message ? (
              <p
                className={cn(
                  "rounded-[0.65rem] border px-3.5 py-2.5 text-[13px] leading-relaxed",
                  isError
                    ? "border-amber-500/30 bg-amber-500/[0.08] text-amber-50"
                    : "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-50",
                )}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-[0.65rem] text-[15px] font-medium tracking-wide shadow-bv-primary"
            >
              {pending ? "Submitting…" : "Create account"}
            </Button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
