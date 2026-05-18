import { cn } from "@/lib/utils";
import { appMetricLabel } from "@/lib/ui/app-surface";

type SupportMetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: number;
  className?: string;
};

export function SupportMetricCard({ label, value, detail, tone = 0, className }: SupportMetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.12_0.032_262/0.9),oklch(0.09_0.026_266/0.88))] px-4 py-4",
        className,
      )}
    >
      <p className={appMetricLabel}>{label}</p>
      <p
        className={cn(
          "font-display mt-2 text-[1.35rem] leading-none tabular-nums tracking-[-0.03em] sm:text-[1.5rem]",
          tone > 0 && "text-emerald-200",
          tone < 0 && "text-rose-200",
          tone === 0 && "text-zinc-50",
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-1.5 text-[13px] text-zinc-500">{detail}</p> : null}
    </div>
  );
}
