"use client";

import { useState, useTransition } from "react";
import type { AdminUserListItem } from "@/lib/access/admin-types";
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
import { cn } from "@/lib/utils";

type Props = {
  users: AdminUserListItem[];
};

export function AdminUsersTable({ users }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function run(label: string, fn: () => Promise<void>) {
    setMessage(null);
    startTransition(() => {
      void fn()
        .then(() => setMessage(`${label} — saved.`))
        .catch((e: unknown) => setMessage(e instanceof Error ? e.message : "Action failed."));
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-zinc-300">
          {message}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.11_0.04_264/0.5),oklch(0.085_0.032_266/0.65))] shadow-bv-card">
        <table className="w-full min-w-[920px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.08] font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Trial ends</th>
              <th className="px-4 py-3">Premium</th>
              <th className="px-4 py-3">Entries</th>
              <th className="px-4 py-3">Last active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isPrimary = u.email.toLowerCase() === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();
              return (
                <tr key={u.user_id} className="border-b border-white/[0.05] text-zinc-200 last:border-0">
                  <td className="max-w-[14rem] truncate px-4 py-3 font-mono text-[12px] text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3">{u.is_admin ? "Admin" : "User"}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.access_state}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(u.trial_ends_at).toLocaleDateString()}</td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-zinc-500">{u.subscription_label}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-400">{u.journal_entry_count}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {u.last_active_at ? new Date(u.last_active_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[240px] flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] px-2 text-[11px]",
                        )}
                        onClick={() => run("Grant premium", () => grantPremium(u.user_id))}
                      >
                        Grant
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] px-2 text-[11px]",
                        )}
                        onClick={() => run("Revoke premium", () => revokePremium(u.user_id))}
                      >
                        Revoke
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] px-2 text-[11px]",
                        )}
                        onClick={() => run("Extend trial", () => extendTrialDays(u.user_id, 7))}
                      >
                        +7d
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] px-2 text-[11px]",
                        )}
                        onClick={() => run("Make admin", () => makeAdmin(u.user_id))}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-white/[0.1] px-2 text-[11px]",
                        )}
                        onClick={() => run("Remove admin", () => removeAdmin(u.user_id))}
                      >
                        −Admin
                      </button>
                      <button
                        type="button"
                        disabled={pending || isPrimary}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-8 rounded-lg border-rose-500/30 px-2 text-[11px] text-rose-200",
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
