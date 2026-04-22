"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const startedAt = Date.now();
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      return;
    }

    const minVisualMs = 900;
    const remaining = minVisualMs - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={signingOut}
      className={cn(
        buttonVariants({ variant: "default" }),
        "h-10 rounded-xl bg-[oklch(0.72_0.14_250)] text-[13px] text-[oklch(0.12_0.04_265)] disabled:opacity-70",
      )}
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
