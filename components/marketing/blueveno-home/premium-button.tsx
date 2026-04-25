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
      className={`group relative inline-flex items-center justify-center rounded-full p-[1px] bg-gradient-to-b from-white/[0.28] via-white/[0.1] to-white/[0.03] shadow-[0_0_0_1px_oklch(0.58_0.15_252/0.52),0_24px_70px_-34px_rgba(0,0,0,0.94),0_0_44px_-10px_oklch(0.64_0.17_252/0.68)] transition duration-500 hover:shadow-[0_0_0_1px_oklch(0.73_0.17_252/0.68),0_36px_92px_-34px_rgba(0,0,0,0.96),0_0_68px_-6px_oklch(0.72_0.19_252/0.86)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,oklch(0.72_0.2_252/0.78),transparent_72%)] opacity-55 blur-xl transition duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-5 rounded-full bg-[radial-gradient(circle,oklch(0.68_0.17_248/0.38),transparent_72%)] opacity-40 blur-2xl transition duration-500 group-hover:opacity-90"
      />
      <span
        className={`relative flex items-center justify-center rounded-full bg-[linear-gradient(180deg,oklch(0.6_0.16_252),oklch(0.42_0.12_252))] font-semibold tracking-[-0.02em] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.34),inset_0_-16px_34px_-22px_oklch(0.22_0.12_252/0.5),0_0_18px_-8px_oklch(0.72_0.2_252/0.52)] transition duration-500 group-hover:bg-[linear-gradient(180deg,oklch(0.66_0.16_252),oklch(0.48_0.13_252))] ${
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
      className={`group relative inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[oklch(0.56_0.11_252/0.48)] bg-[linear-gradient(180deg,oklch(0.09_0.045_266/0.74),oklch(0.05_0.03_268/0.84))] px-[1.65rem] text-[13px] font-medium tracking-[-0.02em] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_34px_-12px_oklch(0.62_0.15_252/0.6)] transition duration-500 hover:border-[oklch(0.7_0.14_252/0.58)] hover:bg-[linear-gradient(180deg,oklch(0.11_0.05_266/0.82),oklch(0.06_0.03_268/0.9))] hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),0_0_52px_-8px_oklch(0.68_0.16_252/0.74)] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(circle,oklch(0.66_0.16_252/0.5),transparent_72%)] opacity-45 blur-xl transition duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-5 rounded-full bg-[radial-gradient(circle,oklch(0.64_0.14_248/0.3),transparent_74%)] opacity-30 blur-2xl transition duration-500 group-hover:opacity-80"
      />
      {children}
    </Link>
  );
}
