/** Turn API/Supabase errors into short, human copy for toasts and inline feedback. */
export function formatUserError(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) {
    return humanizeMessage(error.trim());
  }
  if (error instanceof Error && error.message.trim()) {
    return humanizeMessage(error.message.trim());
  }
  return fallback;
}

function humanizeMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("jwt") || lower.includes("session")) {
    return "Session expired. Refresh the page and try again.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Connection issue. Check your network and try again.";
  }
  if (lower.includes("row-level security") || lower.includes("permission denied")) {
    return "You don't have permission for this action.";
  }
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "That record already exists.";
  }
  return message;
}
