import type { LucideIcon } from "lucide-react";
import { InsightCard, type InsightSeverity } from "@/components/v2/cards/insight-card";
import { cn } from "@/lib/utils";

export type InsightListItem = {
  id: string;
  title: string;
  body: string;
  severity?: InsightSeverity;
  tag?: string;
  metric?: string;
  icon?: LucideIcon;
};

type InsightListProps = {
  items: InsightListItem[];
  className?: string;
  empty?: React.ReactNode;
};

export function InsightList({ items, className, empty }: InsightListProps) {
  if (items.length === 0) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <ul className={cn("grid gap-2.5", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <InsightCard
            title={item.title}
            body={item.body}
            severity={item.severity}
            tag={item.tag}
            metric={item.metric}
            icon={item.icon}
          />
        </li>
      ))}
    </ul>
  );
}
