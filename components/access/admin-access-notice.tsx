"use client";

import { ShieldCheck } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Subtle admin-only notice — no upgrade CTAs */
export function AdminAccessNotice({ className }: Props) {
  const { isAdmin, state } = useAccess();

  if (!isAdmin && state !== "admin") return null;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-[13px] text-emerald-100/90",
        className,
      )}
      role="status"
    >
      <ShieldCheck className="size-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
      <span>Admin access — full workspace, no billing required.</span>
    </p>
  );
}
