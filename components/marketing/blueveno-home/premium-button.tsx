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
      className={`group relative inline-flex items-center justify-center rounded-full p-[1px] bg-gradient-to-b from-white/[0.22] via-white/[0.07] to-white/[0.02] shadow-[0_0_0_1px_oklch(0.52_0.14_252/0.38),0_28px_80px_-36px_rgba(0,0,0,0.94)] transition duration-500 hover:shadow-[0_0_0_1px_oklch(0.62_0.14_252/0.48),0_36px_88px_-36px_rgba(0,0,0,0.96)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.64_0.16_252/0.42),transparent_70%)] opacity-0 blur-xl transition duration-500 group-hover:opacity-100"
      />
      <span
        className={`relative flex items-center justify-center rounded-full bg-[oklch(0.54_0.13_252)] font-semibold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_-14px_28px_-22px_oklch(0.22_0.12_252/0.4)] transition duration-500 group-hover:bg-[oklch(0.6_0.11_252)] ${
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
      className={`group relative inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-[1.65rem] text-[13px] font-medium tracking-[-0.02em] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] transition duration-500 hover:border-[oklch(0.55_0.12_252/0.35)] hover:bg-white/[0.05] hover:text-white ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.58_0.13_252/0.26),transparent_70%)] opacity-0 blur-lg transition duration-500 group-hover:opacity-100"
      />
      {children}
    </Link>
  );
}
