import { cn } from "@/lib/utils";

type BluevenoWordmarkProps = {
  className?: string;
};

/**
 * White wordmark for dark UI (sidebar, chrome). Uses display font for brand consistency.
 */
export function BluevenoWordmark({ className }: BluevenoWordmarkProps) {
  return (
    <span
      className={cn(
        "font-display text-[1.125rem] font-semibold tracking-[-0.045em] text-white",
        className,
      )}
    >
      Blueveno
    </span>
  );
}
