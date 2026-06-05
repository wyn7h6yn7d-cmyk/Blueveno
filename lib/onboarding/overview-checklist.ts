/** Hide onboarding once the workspace has meaningful history (aligned with behavior insights). */
export const ONBOARDING_HIDE_TRADED_DAYS = 5;
export const ONBOARDING_HIDE_ENTRY_COUNT = 10;

/** Stats checklist step unlocks after a few distinct trading days. */
export const ONBOARDING_STATS_UNLOCK_TRADED_DAYS = 3;

/** Calendar step — user has enough days to review a week pattern. */
export const ONBOARDING_CALENDAR_REVIEW_TRADED_DAYS = 2;

export type OverviewOnboardingInput = {
  accountCount: number;
  entryCount: number;
  tradedDays: number;
  /** User chose to hide the Getting started card on Overview. */
  dismissed?: boolean;
};

export type OverviewOnboardingItem = {
  id: "account" | "first-day" | "calendar" | "stats";
  label: string;
  href: string;
  completed: boolean;
};

export type OverviewOnboardingResult = {
  show: boolean;
  items: OverviewOnboardingItem[];
};

function hasEnoughWorkspaceData(entryCount: number, tradedDays: number): boolean {
  return tradedDays >= ONBOARDING_HIDE_TRADED_DAYS || entryCount >= ONBOARDING_HIDE_ENTRY_COUNT;
}

function buildAllItems(input: OverviewOnboardingInput): OverviewOnboardingItem[] {
  const { accountCount, entryCount, tradedDays } = input;
  const items: OverviewOnboardingItem[] = [
    {
      id: "account",
      label: "Create your first trading account",
      href: "/app/settings?section=accounts",
      completed: accountCount >= 1,
    },
    {
      id: "first-day",
      label: "Log your first trading day",
      href: "/app/journal?tab=add",
      completed: entryCount >= 1,
    },
    {
      id: "calendar",
      label: "Review your week in Calendar",
      href: "/app/calendar",
      completed: tradedDays >= ONBOARDING_CALENDAR_REVIEW_TRADED_DAYS,
    },
  ];

  if (entryCount >= 1) {
    items.push({
      id: "stats",
      label: "Unlock Stats after a few logged days",
      href: "/app/stats",
      completed: tradedDays >= ONBOARDING_STATS_UNLOCK_TRADED_DAYS,
    });
  }

  return items;
}

export function getOverviewOnboardingChecklist(input: OverviewOnboardingInput): OverviewOnboardingResult {
  if (input.dismissed) {
    return { show: false, items: [] };
  }

  if (hasEnoughWorkspaceData(input.entryCount, input.tradedDays)) {
    return { show: false, items: [] };
  }

  const items = buildAllItems(input).filter((item) => !item.completed);
  return { show: items.length > 0, items };
}

export const OVERVIEW_ONBOARDING_EMPTY_COPY =
  "Start with one trading day. Blueveno gets smarter as your journal fills.";
