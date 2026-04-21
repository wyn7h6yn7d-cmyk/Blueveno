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
import { KeyRound, LogOut, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DISPLAY_CURRENCY_CODES,
  displayCurrencyLabel,
  normalizeDisplayCurrency,
} from "@/lib/format-pnl";
import { allTimezoneOptionValues, TIMEZONE_GROUPS } from "@/lib/timezone-options";

const field =
  "h-10 rounded-xl border-white/[0.1] bg-black/25 text-[15px] text-zinc-100 shadow-[inset_0_1px_2px_oklch(0_0_0/0.15)] placeholder:text-zinc-600";

export function SettingsProfileForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [displayCurrency, setDisplayCurrency] = useState("EUR");
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
      const meta = user.user_metadata as {
        full_name?: string;
        name?: string;
        timezone?: string;
        display_currency?: string;
      } | undefined;
      setDisplayName(meta?.full_name ?? meta?.name ?? "");
      setTimezone(meta?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "");
      setDisplayCurrency(normalizeDisplayCurrency(meta?.display_currency));
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
    const tz =
      timezone.trim() ||
      (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: displayName.trim(),
        name: displayName.trim(),
        timezone: tz,
        display_currency: normalizeDisplayCurrency(displayCurrency),
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

  const knownTimezones = allTimezoneOptionValues();
  const timezoneSelectValue = knownTimezones.includes(timezone)
    ? timezone
    : timezone.trim()
      ? timezone
      : "__custom__";

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
        variant="signature"
        eyebrow="Settings"
        title="Account"
        description="Profile, security, and how you sign out."
        actions={
          <Button
            type="submit"
            form="profile-form"
            variant="outline"
            className="h-10 rounded-xl border-white/[0.12] bg-white/[0.04] px-4 text-[13px] text-zinc-100 hover:bg-white/[0.08]"
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
                <p className="text-[13px] text-zinc-600">
                  Used for the live session bar and your local clock in the app header.
                </p>
                <select
                  id="timezone"
                  value={timezoneSelectValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__custom__") setTimezone("");
                    else setTimezone(v);
                  }}
                  className={cn(field, "cursor-pointer")}
                >
                  {TIMEZONE_GROUPS.map((g) => (
                    <optgroup key={g.region} label={g.region}>
                      {g.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  {timezone && !knownTimezones.includes(timezone) ? (
                    <option value={timezone}>{timezone} (saved)</option>
                  ) : null}
                  <option value="__custom__">Custom IANA…</option>
                </select>
                {timezoneSelectValue === "__custom__" ? (
                  <Input
                    id="timezone-custom"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. Europe/Lisbon or America/Phoenix"
                    className={field}
                    aria-label="Custom IANA timezone"
                  />
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="display-currency" className="text-[13px] text-zinc-300">
                  Display currency
                </Label>
                <p className="text-[13px] text-zinc-600">
                  {"Journal P&L, stats, and calendar use this for formatting."}
                </p>
                <select
                  id="display-currency"
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  className={cn(field, "cursor-pointer")}
                >
                  {DISPLAY_CURRENCY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code} — {displayCurrencyLabel(code)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {message ? <p className="mt-4 text-sm text-zinc-400">{message}</p> : null}
        </DashboardCard>
      </form>

        <DashboardCard
          eyebrow="Security"
          title="Password & sign-in"
          description="Update credentials and control where you stay signed in."
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

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <div>
            <p className="text-[15px] text-zinc-200">Billing & plan</p>
            <p className="text-sm text-zinc-500">Plan and invoices</p>
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
