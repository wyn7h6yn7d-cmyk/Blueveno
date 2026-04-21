"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bell, KeyRound, LogOut, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const field =
  "h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600";

export function SettingsProfileForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !user) {
        setLoading(false);
        setMessage("Could not load profile — try signing in again.");
        return;
      }
      setEmail(user.email ?? "");
      setPendingEmail(user.email ?? "");
      const meta = user.user_metadata as { full_name?: string; name?: string; timezone?: string } | undefined;
      setDisplayName(meta?.full_name ?? meta?.name ?? "");
      setTimezone(meta?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim(),
        name: displayName.trim(),
        timezone: timezone.trim(),
      },
    });
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  async function onUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword.trim()) {
      setAccountMessage("Enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setAccountMessage("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAccountMessage("Passwords do not match.");
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setAccountMessage("Password updated.");
  }

  async function onUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingEmail.trim()) {
      setAccountMessage("Enter an email.");
      return;
    }
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email: pendingEmail.trim() });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    setAccountMessage("Check your inbox to confirm the new email.");
  }

  async function signOut(scope: "local" | "others") {
    setAccountBusy(true);
    setAccountMessage(null);
    const supabase = createClient();
    const { error } =
      scope === "others"
        ? await supabase.auth.signOut({ scope: "others" })
        : await supabase.auth.signOut({ scope: "local" });
    setAccountBusy(false);
    if (error) {
      setAccountMessage(error.message);
      return;
    }
    if (scope === "local") {
      router.push("/");
      router.refresh();
      return;
    }
    setAccountMessage("Signed out from other devices.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        description="Profile and security for this Supabase-backed account."
        actions={
          <Button
            type="submit"
            form="profile-form"
            variant="outline"
            className="h-9 rounded-xl border-white/[0.1] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
            disabled={loading || saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <form id="profile-form" onSubmit={onSave}>
        <DashboardCard
          eyebrow="Profile"
          title="Identity"
          description="How you appear on exports and shared recaps."
        >
          {loading ? (
            <p className="text-[15px] text-zinc-500">Loading profile…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-[13px] text-zinc-300">
                  Display name
                </Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Trader name"
                  className={field}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] text-zinc-300">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email ?? ""}
                  readOnly
                  className={cn(field, "cursor-not-allowed opacity-80")}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="timezone" className="text-[13px] text-zinc-300">
                  Timezone
                </Label>
                <Input
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="America/New_York"
                  className={field}
                />
              </div>
            </div>
          )}
          {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
        </DashboardCard>
      </form>

      <DashboardCard
        eyebrow="Security"
        title="Account security"
        description="Standard account actions for this MVP."
      >
        <form onSubmit={onUpdatePassword} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[13px] text-zinc-300">
                New password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={field}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[13px] text-zinc-300">
                Confirm password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={field}
                autoComplete="new-password"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="h-9 rounded-xl border-white/[0.1] bg-transparent"
            disabled={accountBusy}
          >
            Update password
          </Button>
        </form>

        <form onSubmit={onUpdateEmail} className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="pending-email" className="text-[13px] text-zinc-300">
                Change email
              </Label>
              <Input
                id="pending-email"
                type="email"
                value={pendingEmail}
                onChange={(e) => setPendingEmail(e.target.value)}
                placeholder="you@example.com"
                className={field}
                autoComplete="email"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="h-9 rounded-xl border-white/[0.1] bg-transparent"
              disabled={accountBusy}
            >
              Update email
            </Button>
          </div>
        </form>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 text-[oklch(0.65_0.12_250)]" strokeWidth={1.75} />
            <div>
              <p className="text-[15px] font-medium text-zinc-200">Current device session</p>
              <p className="text-sm text-zinc-500">Sign out from this browser.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent"
            disabled={accountBusy}
            onClick={() => signOut("local")}
          >
            <LogOut className="mr-2 size-4" />
            Sign out
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 size-5 text-zinc-500" strokeWidth={1.75} />
            <div>
              <p className="text-[15px] font-medium text-zinc-200">Other device sessions</p>
              <p className="text-sm text-zinc-500">Revoke active sessions on other devices.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent"
            disabled={accountBusy}
            onClick={() => signOut("others")}
          >
            Sign out others
          </Button>
        </div>
        {accountMessage ? <p className="mt-5 text-sm text-zinc-400">{accountMessage}</p> : null}
      </DashboardCard>

      <DashboardCard
        eyebrow="Notifications"
        title="Alerts"
        description="Delivery channels are not configured in this build—no silent toggles."
      >
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <Bell className="mt-0.5 size-4 shrink-0 text-zinc-500" strokeWidth={1.75} />
          <p className="text-[14px] leading-relaxed text-zinc-400">
            Email and in-app alerts will appear here once notification preferences and delivery are connected. Nothing is
            subscribed automatically in the MVP.
          </p>
        </div>
      </DashboardCard>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <div>
            <p className="text-[15px] text-zinc-200">Billing & plan</p>
            <p className="text-sm text-zinc-500">Test period — full access. Stripe portal when billing goes live.</p>
          </div>
        </div>
        <Link
          href="/app/settings/billing"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-[oklch(0.78_0.12_250)] hover:underline"
        >
          Open billing →
        </Link>
      </div>
    </div>
  );
}
