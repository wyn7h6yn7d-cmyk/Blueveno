import type { ReactNode } from "react";
import { CardBase, type CardBaseProps } from "@/components/v2/cards/card-base";
import { CardSkeleton } from "@/components/v2/states/card-skeleton";
import { cn } from "@/lib/utils";

type TableCardProps = Omit<CardBaseProps, "contentClassName"> & {
  toolbar?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

export function TableCard({
  toolbar,
  loading,
  children,
  contentClassName,
  ...props
}: TableCardProps) {
  if (loading) {
    return <CardSkeleton rows={5} className={props.className} />;
  }

  return (
    <CardBase
      {...props}
      toolbar={toolbar}
      contentClassName={cn("p-0 sm:p-0", contentClassName)}
      as="section"
    >
      {children}
    </CardBase>
  );
}
