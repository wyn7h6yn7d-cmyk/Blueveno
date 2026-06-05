import { StatusPill, type StatusPillTone } from "@/components/v2/data/status-pill";
import { cn } from "@/lib/utils";

type TagCellProps = {
  tags: string[];
  max?: number;
  tone?: StatusPillTone;
  className?: string;
};

export function TagCell({ tags, max = 2, tone = "neutral", className }: TagCellProps) {
  if (tags.length === 0) {
    return <span className="text-[12px] text-zinc-600">—</span>;
  }

  const visible = tags.slice(0, max);
  const overflow = tags.length - visible.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {visible.map((tag) => (
        <StatusPill key={tag} tone={tone} size="sm">
          {tag}
        </StatusPill>
      ))}
      {overflow > 0 ? (
        <span className="text-[10px] text-zinc-500">+{overflow}</span>
      ) : null}
    </div>
  );
}
