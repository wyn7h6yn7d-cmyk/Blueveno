import { cn } from "@/lib/utils";

type InlineFeedbackProps = {
  message: string | null;
  tone?: "success" | "error" | "neutral";
  className?: string;
};

const toneClass = {
  success: "text-emerald-400/95",
  error: "text-rose-400/95",
  neutral: "text-zinc-400",
};

export function InlineFeedback({ message, tone = "neutral", className }: InlineFeedbackProps) {
  if (!message?.trim()) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("text-[13px] leading-snug", toneClass[tone], className)}
    >
      {message}
    </p>
  );
}
