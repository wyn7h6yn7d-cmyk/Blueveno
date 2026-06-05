import type { ReactNode } from "react";
import { CardBase, type CardBaseProps } from "@/components/v2/cards/card-base";
import { CardSkeleton } from "@/components/v2/states/card-skeleton";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import { ErrorStatePanel } from "@/components/v2/states/error-state-panel";

type SectionCardProps = Omit<CardBaseProps, "as"> & {
  loading?: boolean;
  empty?: ReactNode;
  error?: string | null;
};

export function SectionCard({
  loading,
  empty,
  error,
  children,
  ...props
}: SectionCardProps) {
  if (loading) {
    return <CardSkeleton className={props.className} />;
  }

  if (error) {
    return (
      <CardBase {...props} as="section">
        <ErrorStatePanel title="Unable to load section" description={error} compact />
      </CardBase>
    );
  }

  if (!children && empty) {
    return (
      <CardBase {...props} as="section" contentClassName="p-0 sm:p-0">
        {empty}
      </CardBase>
    );
  }

  return (
    <CardBase {...props} as="section">
      {children}
    </CardBase>
  );
}

export function SectionCardEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return <EmptyStatePanel title={title} description={description} compact />;
}
