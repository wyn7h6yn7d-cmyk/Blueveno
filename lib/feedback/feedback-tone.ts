export function feedbackToneFromMessage(message: string | null): "success" | "error" | "neutral" {
  if (!message?.trim()) return "neutral";
  const m = message.toLowerCase();
  if (
    m.includes("ready") ||
    m.includes("saved") ||
    m.includes("updated") ||
    m.includes("created") ||
    m.includes("deleted") ||
    m.includes("signed out") ||
    m.includes("confirm the new email")
  ) {
    return "success";
  }
  return "error";
}
