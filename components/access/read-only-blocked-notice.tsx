"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { PremiumRequestLink } from "@/components/analytics/premium-request-link";
import {
  isReadOnlyWorkspace,
  PLAN_ACCESS_HREF,
  readOnlyBlockedMessage,
} from "@/lib/access/access-messaging";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type Props = {
  /** e.g. "adding trading days" — woven into the default message */
  context?: string;
  message?: string;
  compact?: boolean;
  className?: string;
};

/** Inline notice when a write action is blocked after trial */
export function ReadOnlyBlockedNotice({ context, message, compact = false, className }: Props) {
  const access = useAccess();

  if (!isReadOnlyWorkspace(access)) return null;

  const body = message ?? readOnlyBlockedMessage(context);

  if (compact) {
    return (
      <p className={cn("text-[13px] leading-relaxed text-zinc-400", className)} role="status">
        {body}{" "}
        <PremiumRequestLink
          source="read_only_notice_compact"
          className="font-medium text-[oklch(0.78_0.11_252)] underline-offset-4 hover:underline"
        >
          Request Premium access
        </PremiumRequestLink>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-black/25 text-zinc-400">
          <Lock className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-zinc-300">Read-only</p>
          <p className="mt-1 text-[14px] leading-relaxed text-zinc-400">{body}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <PremiumRequestLink source="read_only_notice" className={cn(appPrimaryCta, "h-9 px-4 text-[13px]")}>
          Request Premium access
        </PremiumRequestLink>
        <Link href={PLAN_ACCESS_HREF} className={cn(appSecondaryCta, "h-9 px-4 text-[13px]")}>
          Plan &amp; access
        </Link>
      </div>
    </div>
  );
}
