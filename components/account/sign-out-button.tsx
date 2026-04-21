"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className={cn(
        buttonVariants({ variant: "default" }),
        "h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[13px] text-[oklch(0.12_0.04_265)]",
      )}
    >
      Sign out
    </button>
  );
}
