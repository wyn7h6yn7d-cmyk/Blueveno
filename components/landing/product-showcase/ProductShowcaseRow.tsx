import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { cn } from "@/lib/utils";

export type ProductShowcaseRowProps = {
  id: string;
  index: number;
  eyebrow: string;
  promise: string;
  /** One short line — optional */
  copy?: string;
  visual: ReactNode;
  reverse?: boolean;
  cta: { href: string; label: string };
};

export function ProductShowcaseRow({
  id,
  index,
  eyebrow,
  promise,
  copy,
  visual,
  reverse = false,
  cta,
}: ProductShowcaseRowProps) {
  return (
    <div
      id={id}
      className="scroll-mt-28 border-b border-border/35 pb-20 last:border-b-0 last:pb-0 lg:pb-28 lg:last:pb-0"
    >
      <div
        className={cn(
          "flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14 xl:gap-20",
          reverse && "lg:flex-row-reverse",
        )}
      >
        <Reveal className="order-2 flex flex-1 flex-col justify-center lg:order-none lg:max-w-[26rem]">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-3xl font-medium tabular-nums text-zinc-700/90">
              {String(index).padStart(2, "0")}
            </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bv-eyebrow/90">{eyebrow}</p>
          </div>
          <h3 className="font-display mt-4 text-[1.5rem] font-medium leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-2xl">
            {promise}
          </h3>
          {copy ? <p className="mt-3 max-w-sm text-[13px] leading-snug text-zinc-500">{copy}</p> : null}
          <Link
            href={cta.href}
            className="mt-8 inline-flex w-fit items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/85 transition hover:text-primary"
          >
            {cta.label}
            <span aria-hidden className="text-primary">
              →
            </span>
          </Link>
          <div className="mt-10 h-px max-w-[12rem] bg-gradient-to-r from-primary/30 via-bv-border-accent to-transparent opacity-90" />
        </Reveal>

        <Reveal delay={0.06} className="order-1 min-w-0 flex-1 lg:order-none">
          {visual}
        </Reveal>
      </div>
    </div>
  );
}
