import { CardSkeleton } from "@/components/v2/states/card-skeleton";

type LoadingSkeletonProps = {
  rows?: number;
  variant?: "default" | "metric" | "chart";
  className?: string;
};

/** Loading placeholder matching v2 card shells — use while data fetches. */
export function LoadingSkeleton(props: LoadingSkeletonProps) {
  return <CardSkeleton {...props} />;
}
