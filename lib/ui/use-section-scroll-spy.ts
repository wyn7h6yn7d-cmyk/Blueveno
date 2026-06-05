"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  enabled?: boolean;
  /** Scroll offset when jumping to a section (px from top of viewport). */
  scrollOffset?: number;
};

export function useSectionScrollSpy(sectionIds: string[], options?: Options) {
  const enabled = options?.enabled ?? true;
  const scrollOffset = options?.scrollOffset ?? 88;
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const scrollSpyEnabled = useRef(false);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      scrollSpyEnabled.current = false;
      setActiveId(id);
      const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      window.setTimeout(() => {
        scrollSpyEnabled.current = true;
      }, 700);
    },
    [scrollOffset],
  );

  useEffect(() => {
    if (!enabled || sectionIds.length === 0) return;
    scrollSpyEnabled.current = true;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!scrollSpyEnabled.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top && sectionIds.includes(top)) setActiveId(top);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.12, 0.35, 0.6] },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled, sectionIds]);

  const resolvedActiveId = sectionIds.includes(activeId) ? activeId : (sectionIds[0] ?? activeId);

  return { activeId: resolvedActiveId, scrollToSection };
}
