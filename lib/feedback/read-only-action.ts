import { trackReadOnlyBlockedAction } from "@/lib/analytics/track-product-event";
import { READ_ONLY_BLOCKED_TOAST } from "@/lib/feedback/read-only";

type ToastLike = { error: (message: string) => void };

/** Show read-only toast and record a privacy-safe analytics event. */
export function notifyReadOnlyBlocked(toast: ToastLike, context: string): void {
  trackReadOnlyBlockedAction(context);
  toast.error(READ_ONLY_BLOCKED_TOAST);
}
