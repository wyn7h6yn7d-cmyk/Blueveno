import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  appCardKpi,
  appCardShell,
  appInnerPanel,
  appInnerPanelNegative,
  appInnerPanelPositive,
} from "@/lib/ui/app-surface";

export type CardVariant = "shell" | "kpi" | "inner" | "positive" | "negative";

const variantClass: Record<CardVariant, string> = {
  shell: appCardShell,
  kpi: appCardKpi,
  inner: appInnerPanel,
  positive: appInnerPanelPositive,
  negative: appInnerPanelNegative,
};

type CardShellProps = {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
  as?: ElementType;
};

export function CardShell({ variant = "shell", className, children, as: Tag = "div" }: CardShellProps) {
  return <Tag className={cn(variantClass[variant], className)}>{children}</Tag>;
}

type MetricCardProps = Omit<CardShellProps, "variant" | "as">;

export function MetricCard({ className, children }: MetricCardProps) {
  return (
    <CardShell variant="kpi" className={className}>
      {children}
    </CardShell>
  );
}

type SectionCardProps = Omit<CardShellProps, "variant"> & {
  as?: "section" | "div";
};

export function SectionCard({ className, children, as = "section" }: SectionCardProps) {
  return (
    <CardShell variant="shell" className={className} as={as}>
      {children}
    </CardShell>
  );
}

type InnerPanelProps = Omit<CardShellProps, "variant"> & {
  tone?: "neutral" | "positive" | "negative";
};

export function InnerPanel({ tone = "neutral", className, children, as }: InnerPanelProps) {
  const variant: CardVariant =
    tone === "positive" ? "positive" : tone === "negative" ? "negative" : "inner";
  return (
    <CardShell variant={variant} className={className} as={as}>
      {children}
    </CardShell>
  );
}
