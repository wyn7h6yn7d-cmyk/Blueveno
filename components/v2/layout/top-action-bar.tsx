import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2TopBarShell } from "@/lib/ui/v2-surface";

type TopActionBarProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
  sticky?: boolean;
};

export function TopActionBar({ left, center, right, className, sticky = true }: TopActionBarProps) {
  return (
    <div
      className={cn(
        v2TopBarShell,
        "flex min-h-[3.25rem] items-center gap-3 px-4 sm:px-5",
        sticky && "sticky top-0 z-30",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
      {center ? <div className="hidden min-w-0 flex-[2] items-center justify-center md:flex">{center}</div> : null}
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </div>
  );
}
