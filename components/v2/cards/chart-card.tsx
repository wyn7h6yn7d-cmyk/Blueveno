import type { ReactNode } from "react";
import { CardBase, type CardBaseProps } from "@/components/v2/cards/card-base";
import { ChartPlaceholder } from "@/components/v2/states/chart-placeholder";
import { CardSkeleton } from "@/components/v2/states/card-skeleton";
import { cn } from "@/lib/utils";

type ChartCardProps = Omit<CardBaseProps, "children" | "contentClassName"> & {
  children?: ReactNode;
  loading?: boolean;
  hasData?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  contentClassName?: string;
};

export function ChartCard({
  children,
  loading,
  hasData = true,
  emptyTitle,
  emptyDescription,
  contentClassName,
  ...props
}: ChartCardProps) {
  if (loading) {
    return <CardSkeleton variant="chart" className={props.className} />;
  }

  return (
    <CardBase {...props} as="section" contentClassName={cn("p-3 sm:p-4", contentClassName)}>
      {hasData && children ? (
        children
      ) : (
        <ChartPlaceholder title={emptyTitle} description={emptyDescription} />
      )}
    </CardBase>
  );
}
