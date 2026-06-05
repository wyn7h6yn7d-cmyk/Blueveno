import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowAction = {
  id: string;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type RowActionsCellProps = {
  actions: RowAction[];
  className?: string;
  /** Custom trigger instead of kebab menu */
  trigger?: ReactNode;
};

export function RowActionsCell({ actions, className, trigger }: RowActionsCellProps) {
  if (actions.length === 0) return null;

  return (
    <div className={cn("flex justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-zinc-200"
          aria-label="Row actions"
        >
          {trigger ?? <MoreHorizontal className="size-4" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              variant={action.destructive ? "destructive" : "default"}
              onClick={action.onSelect}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
