import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { v2TableHeader, v2TableRow } from "@/lib/ui/v2-surface";

type DataTableShellProps = {
  children: ReactNode;
  className?: string;
};

export function DataTableShell({ children, className }: DataTableShellProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-white/[0.07]", className)}>
      <table className="w-full min-w-[32rem] border-collapse text-left text-[13px]">
        {children}
      </table>
    </div>
  );
}

export function DataTableHead({
  children,
  sticky = true,
}: {
  children: ReactNode;
  sticky?: boolean;
}) {
  return (
    <thead className={cn(v2TableHeader, sticky && "sticky top-0 z-10 backdrop-blur-sm")}>
      {children}
    </thead>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tr className={cn(v2TableRow, className)}>{children}</tr>;
}

export function DataTableTh({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn("px-3 py-2.5 font-medium text-zinc-400 first:pl-4 last:pr-4", className)}
    >
      {children}
    </th>
  );
}

export function DataTableTd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-2.5 text-zinc-200 first:pl-4 last:pr-4", className)}>
      {children}
    </td>
  );
}
