import { cn } from "@/lib/utils";

type SetupTagsProps = {
  tags: string[];
  className?: string;
  size?: "sm" | "md";
};

export function SetupTags({ tags, className, size = "md" }: SetupTagsProps) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <li
          key={tag}
          className={cn(
            "rounded-full border border-white/[0.1] bg-white/[0.04] font-mono uppercase tracking-[0.12em] text-zinc-300",
            size === "sm" ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]",
          )}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
