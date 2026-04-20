import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Wider readable column for hero-adjacent sections */
  size?: "default" | "wide" | "narrow";
};

const maxWidth = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
} as const;

export function Section({
  id,
  children,
  className = "",
  containerClassName = "",
  size = "default",
}: SectionProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-28", className)}>
      <div
        className={cn(
          "mx-auto w-full px-5 sm:px-6 lg:px-8",
          maxWidth[size],
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
