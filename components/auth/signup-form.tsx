"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthPlaceholder } from "@/components/auth/social-auth-placeholder";
import { authFieldClass, authLabelClass } from "@/lib/auth-field";
import { cn } from "@/lib/utils";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setIsError(false);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { message?: string };
    setPending(false);
    setIsError(!res.ok);
    setMessage(data.message ?? `Request finished with HTTP ${res.status}.`);
  }

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.07] bg-bv-surface/55 shadow-bv-float backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative px-6 pb-8 pt-7 sm:px-8 sm:pb-9 sm:pt-8">
        <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              New workspace
            </p>
            <p className="mt-2 max-w-[22rem] text-[13px] leading-relaxed text-zinc-500">
              Full self-serve signup is still tightening with the data layer. For now, use demo
              credentials on Sign in, or leave your details if the API accepts the request.
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

        <SocialAuthPlaceholder />
      </div>
    </div>
  );
}
