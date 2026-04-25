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
      className={`group relative inline-flex items-center justify-center rounded-full p-[1px] bg-gradient-to-b from-white/[0.26] via-white/[0.09] to-white/[0.02] shadow-[0_0_0_1px_oklch(0.54_0.14_252/0.5),0_22px_64px_-32px_rgba(0,0,0,0.94),0_0_34px_-12px_oklch(0.62_0.16_252/0.55)] transition duration-500 hover:shadow-[0_0_0_1px_oklch(0.7_0.16_252/0.62),0_34px_86px_-34px_rgba(0,0,0,0.96),0_0_52px_-10px_oklch(0.7_0.17_252/0.72)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.18_252/0.62),transparent_72%)] opacity-40 blur-xl transition duration-500 group-hover:opacity-100"
      />
      <span
        className={`relative flex items-center justify-center rounded-full bg-[linear-gradient(180deg,oklch(0.57_0.15_252),oklch(0.41_0.12_252))] font-semibold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-14px_28px_-22px_oklch(0.22_0.12_252/0.45)] transition duration-500 group-hover:bg-[linear-gradient(180deg,oklch(0.63_0.15_252),oklch(0.47_0.13_252))] ${
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
      className={`group relative inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[oklch(0.52_0.1_252/0.42)] bg-[linear-gradient(180deg,oklch(0.08_0.04_266/0.72),oklch(0.05_0.03_268/0.82))] px-[1.65rem] text-[13px] font-medium tracking-[-0.02em] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_24px_-14px_oklch(0.6_0.14_252/0.45)] transition duration-500 hover:border-[oklch(0.66_0.13_252/0.5)] hover:bg-[linear-gradient(180deg,oklch(0.1_0.045_266/0.8),oklch(0.06_0.03_268/0.88))] hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_38px_-10px_oklch(0.66_0.15_252/0.62)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(circle,oklch(0.62_0.14_252/0.4),transparent_72%)] opacity-25 blur-lg transition duration-500 group-hover:opacity-100"
      />
      {children}
    </Link>
  );
}
