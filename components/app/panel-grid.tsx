import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelGridProps = {
  children: ReactNode;
  className?: string;
};

/** 12-column grid at xl; stacks on smaller breakpoints. Children set their own `xl:col-span-*` via `Panel`. */
export function PanelGrid({ children, className }: PanelGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-5", className)}>{children}</div>
  );
}

type PanelProps = {
  children: ReactNode;
  /** 1–12 at the `xl` breakpoint */
  span?: number;
  className?: string;
};

const SPAN: Record<number, string> = {
  12: "xl:col-span-12",
  9: "xl:col-span-9",
  8: "xl:col-span-8",
  7: "xl:col-span-7",
  6: "xl:col-span-6",
  5: "xl:col-span-5",
  4: "xl:col-span-4",
  3: "xl:col-span-3",
  2: "xl:col-span-2",
  1: "xl:col-span-1",
};

export function Panel({ children, span = 12, className }: PanelProps) {
  return <div className={cn(SPAN[span] ?? SPAN[12], className)}>{children}</div>;
}
