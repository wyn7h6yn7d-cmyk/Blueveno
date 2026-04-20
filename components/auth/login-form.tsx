"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SocialAuthPlaceholder } from "@/components/auth/social-auth-placeholder";

const fieldClass =
  "h-11 rounded-xl border-white/10 bg-bv-surface-inset/90 px-3.5 text-[15px] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] placeholder:text-zinc-600 focus-visible:border-[oklch(0.62_0.12_250)] focus-visible:ring-[oklch(0.62_0.12_250)]/45";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="border-glow-subtle rounded-2xl bg-[oklch(0.12_0.025_265/0.85)] p-6 shadow-bv-card backdrop-blur-md sm:p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Credentials</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Use your work email. Single sign-on (SSO) will be available in production. This build
          supports email and password, including demo mode for testing.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <fieldset className="space-y-5">
          <legend className="sr-only">Sign in with email and password</legend>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px] font-medium text-zinc-300">
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
              className={cn(fieldClass)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password" className="text-[13px] font-medium text-zinc-300">
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
              className={cn(fieldClass)}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-xl text-[15px] font-medium shadow-[0_0_48px_-16px_oklch(0.55_0.2_250/0.45)]"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </fieldset>
      </form>

      <SocialAuthPlaceholder />
    </div>
  );
}
