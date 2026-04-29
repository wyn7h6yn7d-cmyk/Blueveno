export const SETUP_TAG_OPTIONS = [
  "Pullback",
  "Breakout",
  "Reversal",
  "Range",
  "News",
  "Trend continuation",
  "Other",
] as const;

export const MISTAKE_TAG_OPTIONS = [
  "None",
  "FOMO",
  "Late entry",
  "Early exit",
  "Moved stop",
  "Overtraded",
  "Revenge",
  "Oversized",
  "Broke plan",
  "Other",
] as const;

export const SESSION_TAG_OPTIONS = [
  "London",
  "New York",
  "London/New York overlap",
  "Asia",
  "Other",
] as const;

export const MARKET_CONDITION_OPTIONS = [
  "Trending",
  "Range",
  "Choppy",
  "High volatility",
  "Low volatility",
  "News-driven",
  "Other",
] as const;

export type SetupTag = (typeof SETUP_TAG_OPTIONS)[number];
export type MistakeTag = (typeof MISTAKE_TAG_OPTIONS)[number];
export type SessionTag = (typeof SESSION_TAG_OPTIONS)[number];
export type MarketCondition = (typeof MARKET_CONDITION_OPTIONS)[number];
