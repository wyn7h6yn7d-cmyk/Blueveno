import Link from "next/link";
import { Bell, KeyRound, Shield, User } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const field =
  "h-10 rounded-xl border-white/10 bg-bv-surface-inset/80 text-zinc-100 placeholder:text-zinc-600";

export default function AppSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace"
        description="Profile, security, and notifications—preferences apply across journal and analytics."
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-xl border-white/[0.1] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]"
            disabled
          >
            Save changes
          </Button>
        }
      />

      <DashboardCard
        eyebrow="Profile"
        title="Identity"
        description="How you appear on exports and shared recaps."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-[13px] text-zinc-300">
              Display name
            </Label>
            <Input id="display-name" placeholder="Trader name" className={field} autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-[13px] text-zinc-300">
              Timezone
            </Label>
            <Input id="timezone" placeholder="America/New_York" className={field} />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard
        eyebrow="Security"
        title="Access"
        description="API keys and sessions — production hardening lands with auth upgrades."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-5 text-[oklch(0.65_0.12_250)]" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-zinc-200">Two-factor authentication</p>
              <p className="text-xs text-zinc-500">TOTP · backup codes</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent"
            disabled
          >
            Enable
          </Button>
        </div>
        <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 size-5 text-zinc-500" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-zinc-200">API keys</p>
              <p className="text-xs text-zinc-500">Broker & data connectors</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-xl border-white/[0.1] bg-transparent"
            disabled
          >
            Manage
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard
        eyebrow="Notifications"
        title="Alerts"
        description="In-app first — email digests when messaging is wired."
      >
        <ul className="space-y-3">
          {[
            { label: "Rule breach near limit", state: "On" },
            { label: "Daily recap ready", state: "Off" },
            { label: "Desk mention", state: "Off" },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-zinc-500" strokeWidth={1.75} />
                <span className="text-sm text-zinc-300">{row.label}</span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                {row.state}
              </span>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <div className="flex items-center gap-3">
          <User className="size-5 text-zinc-500" strokeWidth={1.75} />
          <div>
            <p className="text-sm text-zinc-200">Billing & plan</p>
            <p className="text-xs text-zinc-500">Stripe Customer Portal when keys are live.</p>
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
