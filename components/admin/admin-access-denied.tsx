import Link from "next/link";
import { ShieldX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminAccessDenied() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.12_0.03_264/0.95),oklch(0.09_0.028_268/0.98))] p-5 text-center shadow-[0_26px_70px_-44px_rgba(0,0,0,0.85)] sm:p-7">
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/[0.12] text-rose-200">
        <ShieldX className="size-5" strokeWidth={1.9} />
      </div>
      <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight text-zinc-100">Admin access required</h1>
      <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-relaxed text-zinc-400">
        This area is restricted to workspace administrators. If you need access, contact your account owner.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/app"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.07]",
          )}
        >
          Return to overview
        </Link>
        <Link
          href="/app/settings"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-xl border-white/[0.12] bg-white/[0.03] px-4 text-zinc-200 hover:bg-white/[0.07]",
          )}
        >
          Open settings
        </Link>
      </div>
    </div>
  );
}
