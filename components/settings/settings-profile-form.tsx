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
import { Bell, KeyRound, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

const field =
  "h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-[15px] text-zinc-100 placeholder:text-zinc-600";

export function SettingsProfileForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        description="Profile and preferences — display name is stored with your Supabase account."
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
        title="Access"
        description="API keys and sessions — production hardening lands with auth upgrades."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 text-[oklch(0.65_0.12_250)]" strokeWidth={1.75} />
            <div>
              <p className="text-[15px] font-medium text-zinc-200">Two-factor authentication</p>
              <p className="text-sm text-zinc-500">TOTP · backup codes</p>
            </div>
          </div>
          <Button type="button" variant="outline" className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent" disabled>
            Enable
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 size-5 text-zinc-500" strokeWidth={1.75} />
            <div>
              <p className="text-[15px] font-medium text-zinc-200">API keys</p>
              <p className="text-sm text-zinc-500">Broker & data connectors</p>
            </div>
          </div>
          <Button type="button" variant="outline" className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent" disabled>
            Manage
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard eyebrow="Notifications" title="Alerts" description="In-app first — email digests when messaging is wired.">
        <ul className="space-y-3">
          {[
            { label: "Rule breach near limit", state: "On" },
            { label: "Daily recap ready", state: "Off" },
            { label: "Desk mention", state: "Off" },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-zinc-500" strokeWidth={1.75} />
                <span className="text-[15px] text-zinc-300">{row.label}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{row.state}</span>
            </li>
          ))}
        </ul>
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
