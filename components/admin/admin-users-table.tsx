"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import type { AdminUserListItem } from "@/lib/access/admin-types";
import {
  extendTrialDays,
  grantPremium,
  makeAdmin,
  removeAdmin,
  revokePremium,
  saveAdminUserNotes,
  setAccountDisabled,
} from "@/app/(application)/app/admin/actions";
import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  users: AdminUserListItem[];
};

type BadgeTone = "admin" | "premium" | "trial" | "readonly" | "default" | "disabled";
type AdminFilter = "all" | "admin" | "premium" | "trial_active" | "trial_expired" | "read_only" | "disabled";

function badgeClass(tone: BadgeTone): string {
  switch (tone) {
    case "admin":
      return "border-amber-400/35 bg-amber-500/12 text-amber-100";
    case "premium":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    case "trial":
      return "border-sky-400/25 bg-sky-500/10 text-sky-100";
    case "readonly":
      return "border-zinc-500/30 bg-zinc-800/40 text-zinc-300";
    case "disabled":
      return "border-rose-400/30 bg-rose-500/10 text-rose-100";
    default:
      return "border-white/15 bg-white/[0.04] text-zinc-300";
  }
}

function formatDate(v: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
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
  const [toast, setToast] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<AdminFilter>("all");
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    label: string;
    destructive?: boolean;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUserListItem | null>(null);
  const [notesBusy, setNotesBusy] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [premiumReason, setPremiumReason] = useState("");

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function isProtectedOwner(email: string): boolean {
    return email.toLowerCase().trim() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
  }

  function premiumActive(u: AdminUserListItem): boolean {
    return (
      isProtectedOwner(u.email) ||
      u.premium_active ||
      u.manual_premium ||
      u.subscription_label.toLowerCase().includes("active")
    );
  }

  function isReadOnly(u: AdminUserListItem): boolean {
    return u.access_state === "trial_expired" && !u.account_disabled;
  }

  const filtered = useMemo((): AdminUserListItem[] => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (stateFilter !== "all") {
        if (stateFilter === "admin" && !u.is_admin) return false;
        if (stateFilter === "premium" && !premiumActive(u)) return false;
        if (stateFilter === "trial_active" && u.access_state !== "trial_active") return false;
        if (stateFilter === "trial_expired" && u.access_state !== "trial_expired") return false;
        if (stateFilter === "read_only" && !isReadOnly(u)) return false;
        if (stateFilter === "disabled" && !u.account_disabled) return false;
      }
      if (!q) return true;
      return (
        u.email.toLowerCase().includes(q) ||
        (u.display_name ?? "").toLowerCase().includes(q) ||
        u.access_state.includes(q)
      );
    });
  }, [users, query, stateFilter]);

  const summary = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let admins = 0;
    let premium = 0;
    let trialActive = 0;
    let trialExpired = 0;
    let readOnly = 0;
    let disabled = 0;
    let accounts = 0;
    let entries = 0;
    let newUsers = 0;
    for (const u of users) {
      if (u.is_admin) admins += 1;
      if (premiumActive(u)) premium += 1;
      if (u.access_state === "trial_active") trialActive += 1;
      if (u.access_state === "trial_expired") trialExpired += 1;
      if (isReadOnly(u)) readOnly += 1;
      if (u.account_disabled) disabled += 1;
      accounts += u.account_count;
      entries += u.journal_entry_count;
      const createdAt = new Date(u.created_at).getTime();
      if (!Number.isNaN(createdAt) && createdAt >= sevenDaysAgo) newUsers += 1;
    }
    return { admins, premium, trialActive, trialExpired, readOnly, disabled, accounts, entries, newUsers };
  }, [users]);

  useEffect(() => {
    if (!detailsUser) return;
    setInternalNote(detailsUser.internal_note ?? "");
    setPremiumReason(detailsUser.premium_granted_reason ?? "");
  }, [detailsUser]);

  function run(label: string, fn: () => Promise<void>) {
    setToast(null);
    setPendingLabel(label);
    startTransition(() => {
      void fn()
        .then(() => setToast({ tone: "success", text: `${label} saved.` }))
        .catch((e: unknown) =>
          setToast({ tone: "error", text: e instanceof Error ? e.message : "Action failed." }),
        )
        .finally(() => setPendingLabel(null));
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.12_0.03_264/0.82),oklch(0.09_0.03_266/0.88))] p-4">
        <p className="app-metric-label">Overview metrics</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="app-metric-label">Total users</p>
            <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{users.length}</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="app-metric-label">Premium users</p>
            <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.premium}</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="app-metric-label">Read-only + disabled</p>
            <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.readOnly + summary.disabled}</p>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
            <p className="app-metric-label">New users (7d)</p>
            <p className="mt-1 font-display text-2xl tabular-nums text-zinc-100">{summary.newUsers}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Admins</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.admins}</p></div>
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Trial active</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.trialActive}</p></div>
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Trial expired</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.trialExpired}</p></div>
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Disabled</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.disabled}</p></div>
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Trading accounts</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.accounts}</p></div>
          <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-inset ring-white/[0.06]"><p className="app-metric-label">Journal entries</p><p className="text-[13px] tabular-nums text-zinc-200">{summary.entries}</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="app-metric-label">Filters</span>
          {stateFilter !== "all" ? (
            <span className="rounded-md border border-[oklch(0.58_0.11_252/0.35)] bg-[oklch(0.58_0.11_252/0.12)] px-2 py-0.5 text-[11px] text-zinc-200">
              {stateFilter.replace("_", " ")}
            </span>
          ) : null}
        </div>
        <p className="font-mono text-[11px] text-zinc-500">
          {filtered.length} of {users.length} users
          {pendingLabel ? ` · ${pendingLabel}…` : ""}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-2xl flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or display name…"
            className="h-10 flex-1 rounded-xl border-white/[0.1] bg-black/25 text-[14px] placeholder:text-zinc-600"
            aria-label="Search users by email or display name"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value as AdminFilter)}
            className="h-10 rounded-xl border border-white/[0.1] bg-black/25 px-3 text-[13px] text-zinc-200"
            aria-label="Filter by access state"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="premium">Premium</option>
            <option value="trial_active">Trial active</option>
            <option value="trial_expired">Trial expired</option>
            <option value="read_only">Read-only</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.11_0.035_264/0.92),oklch(0.085_0.03_266/0.94))] shadow-[0_24px_64px_-40px_rgba(0,0,0,0.75)]">
        <table className="w-full min-w-[1360px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/20 app-metric-label">
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Display name</th>
              <th className="px-4 py-3.5">Role</th>
              <th className="px-4 py-3.5">Access</th>
              <th className="px-4 py-3.5">Trial ends</th>
              <th className="px-4 py-3.5">Premium</th>
              <th className="px-4 py-3.5">Accounts</th>
              <th className="px-4 py-3.5">Entries</th>
              <th className="px-4 py-3.5">Last active</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center">
                  <p className="font-display text-lg text-zinc-200">No users match your filters.</p>
                  <p className="mt-1 text-sm text-zinc-500">Adjust filters or search to continue managing access.</p>
                </td>
              </tr>
            ) : null}
            {filtered.map((u) => {
              const isOwner = isProtectedOwner(u.email);
              const isPaid = premiumActive(u);
              const ownerReason = isOwner ? "Owner account is protected." : undefined;
              return (
                <tr
                  key={u.user_id}
                  className="border-b border-white/[0.04] text-zinc-200 transition hover:bg-white/[0.02] last:border-0"
                >
                  <td className="max-w-[16rem] truncate px-4 py-3.5 font-mono text-[12px] text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{u.email}</span>
                      {isOwner ? (
                        <span className="rounded-md border border-amber-400/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-100">
                          Owner
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3.5 text-zinc-300">{u.display_name ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", u.is_admin ? badgeClass("admin") : badgeClass("default"))}>
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {u.access_state === "trial_active" ? (
                        <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", badgeClass("trial"))}>
                          Trial active
                        </span>
                      ) : null}
                      {u.access_state === "trial_expired" ? (
                        <>
                          <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", badgeClass("readonly"))}>
                            Trial expired
                          </span>
                          <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", badgeClass("readonly"))}>
                            Read-only
                          </span>
                        </>
                      ) : null}
                      {u.access_state === "premium_active" ? (
                        <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", badgeClass("premium"))}>
                          Premium
                        </span>
                      ) : null}
                      {u.account_disabled ? (
                        <span className={cn("inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide", badgeClass("disabled"))}>
                          Disabled
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDate(u.trial_ends_at)}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-medium tracking-wide",
                        isPaid
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                          : "border-zinc-500/30 bg-zinc-800/40 text-zinc-300",
                      )}
                    >
                      {isPaid ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-zinc-400">{u.account_count}</td>
                  <td className="px-4 py-3.5 tabular-nums text-zinc-400">{u.journal_entry_count}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDateTime(u.last_active_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] bg-white/[0.02] px-2.5 text-[11px] text-zinc-200 hover:bg-white/[0.06]",
                        )}
                      >
                        <MoreHorizontal className="mr-1 size-4" />
                        Actions
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[13rem] rounded-xl border border-white/[0.09] bg-[oklch(0.125_0.028_262)] p-1.5 text-zinc-100 shadow-bv-float ring-1 ring-white/[0.04]">
                        <DropdownMenuItem className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px]" onClick={() => setDetailsUser(u)}>
                          View details
                        </DropdownMenuItem>
                        {isOwner ? (
                          <DropdownMenuItem disabled className="rounded-lg px-2.5 py-2 text-[12px] text-zinc-500">
                            Owner account is protected.
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px]"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() => run("Grant premium", () => grantPremium(u.user_id))}
                        >
                          Grant premium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200 focus:text-rose-100"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() =>
                            setConfirmState({
                              title: "Revoke premium access?",
                              description: `This will remove paid access for ${u.email}.`,
                              label: "Revoke premium",
                              destructive: true,
                              onConfirm: async () => run("Revoke premium", () => revokePremium(u.user_id)),
                            })
                          }
                        >
                          Revoke premium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px]"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() => run("Extend trial", () => extendTrialDays(u.user_id, 7))}
                        >
                          Extend trial +7d
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px]"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() => run("Make admin", () => makeAdmin(u.user_id))}
                        >
                          Make admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200 focus:text-rose-100"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() =>
                            setConfirmState({
                              title: "Remove admin role?",
                              description: `${u.email} will lose admin permissions.`,
                              label: "Remove admin",
                              destructive: true,
                              onConfirm: async () => run("Remove admin", () => removeAdmin(u.user_id)),
                            })
                          }
                        >
                          Remove admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200 focus:text-rose-100"
                          disabled={isOwner}
                          title={ownerReason}
                          onClick={() =>
                            setConfirmState({
                              title: u.account_disabled ? "Enable user?" : "Disable user?",
                              description: u.account_disabled
                                ? `${u.email} will be able to access the app again.`
                                : `${u.email} will be blocked from accessing the app until re-enabled.`,
                              label: u.account_disabled ? "Enable user" : "Disable user",
                              destructive: !u.account_disabled,
                              onConfirm: async () =>
                                run(u.account_disabled ? "Enable" : "Disable", () =>
                                  setAccountDisabled(u.user_id, !u.account_disabled),
                                ),
                            })
                          }
                        >
                          {u.account_disabled ? "Enable user" : "Disable user"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmState !== null}
        onCancel={() => {
          if (pending) return;
          setConfirmState(null);
        }}
        onConfirm={() => {
          if (!confirmState) return;
          void confirmState.onConfirm();
          setConfirmState(null);
        }}
        pending={pending}
        title={confirmState?.title ?? ""}
        description={confirmState?.description}
        confirmLabel={confirmState?.label ?? "Confirm"}
        destructive={Boolean(confirmState?.destructive)}
      />
      {detailsUser ? (
        <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/70 p-4 backdrop-blur-[1px]">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[linear-gradient(180deg,oklch(0.13_0.035_264/0.97),oklch(0.09_0.03_266/0.98))] p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.85)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-zinc-100">{detailsUser.email}</p>
                <p className="mt-1 text-[12px] text-zinc-500">User details</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>
            <div className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[12px] text-zinc-400">
              Internal admin view. Sensitive actions should always use confirmations.
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Display name</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{detailsUser.display_name ?? "—"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Access state</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{detailsUser.access_state}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Role</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{detailsUser.is_admin ? "Admin" : "User"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Trial ends</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{formatDate(detailsUser.trial_ends_at)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Premium status</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{premiumActive(detailsUser) ? "Active" : "Inactive"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Premium ends</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{formatDate(detailsUser.premium_ends_at)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Accounts</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{detailsUser.account_count}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Entries</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{detailsUser.journal_entry_count}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Last active</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{formatDateTime(detailsUser.last_active_at)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Created at</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{formatDateTime(detailsUser.created_at)}</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">Premium granted at</p>
                <p className="mt-1.5 text-[13px] text-zinc-100">{formatDateTime(detailsUser.premium_granted_at)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
              <p className="app-metric-label">Trading accounts</p>
              {detailsUser.trading_accounts.length === 0 ? (
                <p className="mt-2 text-[12px] text-zinc-500">No trading accounts.</p>
              ) : (
                <div className="mt-2 space-y-1.5 text-[12px] text-zinc-300">
                  {detailsUser.trading_accounts.map((acc) => (
                    <p key={acc.id}>
                      {acc.name} {acc.account_type ? `(${acc.account_type})` : ""} · created {formatDate(acc.created_at)}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
              <p className="app-metric-label">Recent activity</p>
              {detailsUser.recent_activity.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[12px] text-zinc-300">
                  {detailsUser.recent_activity.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] text-zinc-500">No recent entries.</p>
              )}
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
              <p className="app-metric-label">Internal admin notes</p>
              <div className="mt-2 space-y-2">
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/[0.1] bg-black/25 px-3 py-2 text-[12px] text-zinc-100"
                  placeholder="Optional internal note"
                />
                <Input
                  value={premiumReason}
                  onChange={(e) => setPremiumReason(e.target.value)}
                  className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
                  placeholder="Premium granted reason (optional)"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-zinc-500">
                    Premium granted by: {detailsUser.premium_granted_by ?? "—"}
                  </p>
                  <button
                    type="button"
                    disabled={notesBusy}
                    onClick={async () => {
                      setNotesBusy(true);
                      try {
                        await saveAdminUserNotes({
                          userId: detailsUser.user_id,
                          internalNote,
                          premiumGrantedReason: premiumReason,
                        });
                        setToast({ tone: "success", text: "Admin notes saved." });
                      } catch (error) {
                        setToast({ tone: "error", text: error instanceof Error ? error.message : "Could not save notes." });
                      } finally {
                        setNotesBusy(false);
                      }
                    }}
                    className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12px] text-zinc-200 hover:bg-white/[0.06] disabled:opacity-50"
                  >
                    {notesBusy ? "Saving…" : "Save notes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 right-6 z-[120] min-w-[18rem] rounded-xl border px-4 py-3 text-[13px] shadow-[0_20px_60px_-24px_rgba(0,0,0,0.7)]",
            toast.tone === "success"
              ? "border-emerald-400/30 bg-[oklch(0.16_0.06_160/0.95)] text-emerald-100"
              : "border-rose-400/30 bg-[oklch(0.16_0.06_20/0.95)] text-rose-100",
          )}
        >
          {toast.text}
        </div>
      ) : null}
    </div>
  );
}
