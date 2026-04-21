import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  children: ReactNode;
  /** Tighter control for nav / dense UI */
  compact?: boolean;
};

/** Inset-lit primary — reads as physical control, not flat fill */
export function PremiumPrimaryLink({ className = "", compact, children, ...p }: Props) {
  return (
    <Link
      {...p}
      className={`group relative inline-flex items-center justify-center rounded-full p-[1px] bg-gradient-to-b from-white/[0.2] via-white/[0.06] to-white/[0.02] shadow-[0_0_0_1px_oklch(0.52_0.14_252/0.32),0_26px_72px_-32px_rgba(0,0,0,0.92)] transition duration-500 hover:shadow-[0_0_0_1px_oklch(0.58_0.14_252/0.42),0_32px_80px_-32px_rgba(0,0,0,0.95)] ${className}`}
    >
      <span
        className={`relative flex items-center justify-center rounded-full bg-[oklch(0.56_0.13_252)] font-semibold tracking-[-0.02em] text-[oklch(0.045_0.045_268)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-12px_24px_-20px_oklch(0.25_0.12_252/0.35)] transition duration-500 group-hover:bg-[oklch(0.62_0.108_252)] ${
          compact ? "min-h-[2.5rem] px-4 text-[14px]" : "min-h-[2.75rem] px-[2rem] text-[15px]"
        }`}
      >
        {children}
      </span>
    </Link>
  );
}

/** Ice rim + void interior — not default outline */
export function PremiumGhostLink({ className = "", children, ...p }: Props) {
  return (
    <Link
      {...p}
      className={`group inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.015] px-[1.65rem] text-[13px] font-medium tracking-[-0.015em] text-zinc-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition duration-500 hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white ${className}`}
    >
      {children}
    </Link>
  );
}
