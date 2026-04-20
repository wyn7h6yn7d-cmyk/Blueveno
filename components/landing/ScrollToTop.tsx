"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    const rafId = requestAnimationFrame(check);
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", check);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      className={cn(
        "fixed bottom-6 right-5 z-40 flex size-11 items-center justify-center rounded-full border border-white/[0.12] bg-[oklch(0.1_0.03_265/0.92)] text-zinc-200 shadow-bv-card backdrop-blur-md transition-all duration-300",
        "hover:border-[oklch(0.55_0.14_250/0.35)] hover:bg-[oklch(0.12_0.03_265/0.95)] hover:text-[oklch(0.88_0.1_250)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_250)] focus-visible:ring-offset-2 focus-visible:ring-offset-bv-void",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ChevronUp className="size-5" strokeWidth={2} aria-hidden />
    </button>
  );
}
