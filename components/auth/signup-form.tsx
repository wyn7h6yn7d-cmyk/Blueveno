"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SocialAuthPlaceholder } from "@/components/auth/social-auth-placeholder";

const fieldClass =
  "h-11 rounded-xl border-white/10 bg-bv-surface-inset/90 px-3.5 text-[15px] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] placeholder:text-zinc-600 focus-visible:border-[oklch(0.62_0.12_250)] focus-visible:ring-[oklch(0.62_0.12_250)]/45";

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
    <div className="border-glow-subtle rounded-2xl bg-[oklch(0.12_0.025_265/0.85)] p-6 shadow-bv-card backdrop-blur-md sm:p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">New workspace</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Full sign-up is not live yet while we finish the data layer. For now, use demo credentials
          on the <span className="text-zinc-300">Sign in</span> page. You can opt in to launch
          updates separately when we offer it.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <fieldset className="space-y-5">
          <legend className="sr-only">Create account with email and password</legend>

          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-[13px] font-medium text-zinc-300">
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
              className={cn(fieldClass)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-[13px] font-medium text-zinc-300">
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
              className={cn(fieldClass)}
            />
            <p className="text-[11px] text-zinc-600">Minimum eight characters. A password manager is
              recommended.</p>
          </div>

          {message ? (
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                isError
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                  : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100",
              )}
              role="status"
            >
              {message}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-xl text-[15px] font-medium shadow-[0_0_48px_-16px_oklch(0.55_0.2_250/0.45)]"
          >
            {pending ? "Submitting…" : "Create account"}
          </Button>
        </fieldset>
      </form>

      <SocialAuthPlaceholder />
    </div>
  );
}
