import { useCallback, useEffect, useRef } from "react";
import { toDayKey } from "@/lib/user-data/journal-metrics";

/** Local calendar date as YYYY-MM-DD (journal entry dates use this, not UTC midnight). */
export function localTodayKey(): string {
  return toDayKey(new Date());
}

/**
 * Keeps a date field aligned with the local calendar day until the user picks another date.
 * Re-syncs on tab focus and once per minute so a new day rolls over without a full reload.
 */
type FollowLocalTodayOptions = {
  /** When false, the date stays on user-selected values (e.g. deep-linked week anchor). */
  enabled?: boolean;
};

export function useFollowLocalToday(
  value: string,
  setValue: (next: string) => void,
  options?: FollowLocalTodayOptions,
) {
  const enabled = options?.enabled !== false;
  const followsTodayRef = useRef(enabled && value === localTodayKey());

  const setTracked = useCallback(
    (next: string) => {
      followsTodayRef.current = next === localTodayKey();
      setValue(next);
    },
    [setValue],
  );

  useEffect(() => {
    if (!enabled) return;

    const sync = () => {
      const today = localTodayKey();
      if (followsTodayRef.current) {
        setValue(today);
      }
    };

    sync();
    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const intervalId = window.setInterval(sync, 60_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(intervalId);
    };
  }, [enabled, setValue]);

  return setTracked;
}
