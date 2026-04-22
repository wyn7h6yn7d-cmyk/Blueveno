"use client";

import { useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";
import type { AdminUserListItem } from "@/lib/access/admin-types";
import type { AccessState } from "@/lib/access/types";
import {
  extendTrialDays,
  grantPremium,
  makeAdmin,
  removeAdmin,
  revokePremium,
  setAccountDisabled,
} from "@/app/(application)/app/admin/actions";
import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  users: AdminUserListItem[];
};

function accessBadgeClass(state: AccessState): string {
  switch (state) {
    case "admin":
      return "border-amber-400/35 bg-amber-500/12 text-amber-100";
    case "premium_active":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    case "trial_active":
      return "border-sky-400/25 bg-sky-500/10 text-sky-100";
    case "trial_expired":
      return "border-zinc-500/30 bg-zinc-800/40 text-zinc-300";
    default:
      return "border-white/15 bg-white/[0.04] text-zinc-300";
  }
}

function formatDate(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatDateTime(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export function AdminUsersTable({ users }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q) || u.access_state.includes(q));
  }, [users, query]);

  const summary = useMemo(() => {
    let admins = 0;
    let paid = 0;
    let disabled = 0;
    let entries = 0;
    for (const u of filtered) {
      if (u.is_admin) admins += 1;
      const isPrimary = u.email.toLowerCase() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
      if (isPrimary || u.premium_active || u.manual_premium || u.subscription_label.toLowerCase().includes("active")) {
        paid += 1;
      }
      if (u.account_disabled) disabled += 1;
      entries += u.journal_entry_count;
    }
    return { admins, paid, disabled, entries };
  }, [filtered]);

  function run(label: string, fn: () => Promise<void>) {
    setMessage(null);
    startTransition(() => {
      void fn()
        .then(() => setMessage(`${label} — saved.`))
        .catch((e: unknown) => setMessage(e instanceof Error ? e.message : "Action failed."));
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Visible users</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Admins</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.admins}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Paid</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.paid}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Entries</p>
          <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.entries}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by email or state…"
            className="h-10 rounded-xl border-white/[0.1] bg-black/25 pl-9 text-[14px] placeholder:text-zinc-600"
            aria-label="Filter users"
          />
        </div>
        <p className="font-mono text-[11px] text-zinc-500">
          {filtered.length} of {users.length} users · {summary.disabled} disabled
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] text-zinc-200">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.11_0.035_264/0.92),oklch(0.085_0.03_266/0.94))] shadow-[0_24px_64px_-40px_rgba(0,0,0,0.75)]">
        <table className="w-full min-w-[1080px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/20 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Access</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-4 py-3.5">Trial ends</th>
              <th className="px-4 py-3.5">Paid</th>
              <th className="px-4 py-3.5">Entries</th>
              <th className="px-4 py-3.5">Last active</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isPrimary = u.email.toLowerCase() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
              const isPaid =
                isPrimary ||
                u.premium_active ||
                u.manual_premium ||
                u.subscription_label.toLowerCase().includes("active");
              return (
                <tr
                  key={u.user_id}
                  className="border-b border-white/[0.04] text-zinc-200 transition hover:bg-white/[0.02] last:border-0"
                >
                  <td className="max-w-[15rem] truncate px-4 py-3.5 font-mono text-[12px] text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3.5 text-zinc-400">{u.is_admin ? "Admin" : "Member"}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                        accessBadgeClass(u.access_state),
                      )}
                    >
                      {u.access_state.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDate(u.created_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDate(u.trial_ends_at)}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                        isPaid
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                          : "border-zinc-500/30 bg-zinc-800/40 text-zinc-300",
                      )}
                    >
                      {isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-zinc-400">{u.journal_entry_count}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDateTime(u.last_active_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[320px] flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                        onClick={() => run("Grant premium", () => grantPremium(u.user_id))}
                      >
                        Grant premium
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                        onClick={() => run("Revoke premium", () => revokePremium(u.user_id))}
                      >
                        Revoke premium
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                        onClick={() => run("Extend trial", () => extendTrialDays(u.user_id, 7))}
                      >
                        Extend trial +7d
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                        onClick={() => run("Make admin", () => makeAdmin(u.user_id))}
                      >
                        Make admin
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                        onClick={() => run("Remove admin", () => removeAdmin(u.user_id))}
                      >
                        Remove admin
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-rose-500/25 bg-rose-500/[0.06] px-2.5 text-[11px] text-rose-200 hover:bg-rose-500/10",
                        )}
                        onClick={() => run("Disable", () => setAccountDisabled(u.user_id, !u.account_disabled))}
                      >
                        {u.account_disabled ? "Enable" : "Disable"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
