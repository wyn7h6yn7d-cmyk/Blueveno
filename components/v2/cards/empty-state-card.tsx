import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { CardBase, type CardBaseProps } from "@/components/v2/cards/card-base";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";

type EmptyStateCardProps = Omit<CardBaseProps, "children"> & {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateCardProps) {
  return (
    <CardBase {...props} as="section" contentClassName="p-0 sm:p-0">
      <EmptyStatePanel icon={icon} title={title} description={description} action={action} />
    </CardBase>
  );
}
