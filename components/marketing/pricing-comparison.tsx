import { Check, Minus, X } from "lucide-react";
import type { ComparisonRow } from "@/lib/marketing/pricing-copy";
import { cn } from "@/lib/utils";

function Cell({
  kind,
  note,
}: {
  kind: ComparisonRow["trial"];
  note?: string;
}) {
  if (kind === "text" && note) {
    return <span className="text-[13px] leading-snug text-zinc-300">{note}</span>;
  }
  if (kind === "yes") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center justify-center text-emerald-400/90" title="Included">
          <Check className="size-5" strokeWidth={2.25} aria-hidden />
          <span className="sr-only">Included</span>
        </span>
        {note ? <span className="text-[12px] leading-snug text-zinc-500">{note}</span> : null}
      </div>
    );
  }
  if (kind === "no") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center justify-center text-zinc-500" title="Not included">
          <X className="size-5" strokeWidth={2} aria-hidden />
          <span className="sr-only">Not included</span>
        </span>
        {note ? <span className="text-[12px] leading-snug text-zinc-500">{note}</span> : null}
      </div>
    );
  }
  if (kind === "limited" && note) {
    return (
      <span className="inline-flex items-start gap-1.5 text-[13px] text-amber-200/90">
        <Minus className="mt-0.5 size-4 shrink-0" strokeWidth={2} aria-hidden />
        {note}
      </span>
    );
  }
  return <span className="text-zinc-600">—</span>;
}

export function PricingComparison({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.1_0.035_264/0.5),oklch(0.055_0.032_268/0.65))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">Compare trial, premium, and read-only access after trial</caption>
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th scope="col" className="px-4 py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:px-6">
              Feature
            </th>
            <th scope="col" className="px-4 py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:px-6">
              Trial
            </th>
            <th scope="col" className="px-4 py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-[oklch(0.78_0.1_252)] sm:px-6">
              Premium
            </th>
            <th scope="col" className="px-4 py-4 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-500 sm:px-6">
              After trial
              <br />
              <span className="font-normal normal-case tracking-normal text-zinc-600">(no upgrade)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-white/[0.05] last:border-0">
              <th scope="row" className="px-4 py-4 font-sans text-[14px] font-medium text-zinc-200 sm:px-6 sm:text-[15px]">
                {row.feature}
              </th>
              <td className="px-4 py-4 align-top sm:px-6">
                <Cell kind={row.trial} note={row.trialNote} />
              </td>
              <td
                className={cn(
                  "px-4 py-4 align-top sm:px-6",
                  "bg-[oklch(0.42_0.1_252/0.06)]",
                )}
              >
                <Cell kind={row.premium} note={row.premiumNote} />
              </td>
              <td className="px-4 py-4 align-top sm:px-6">
                <Cell kind={row.expired} note={row.expiredNote} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
