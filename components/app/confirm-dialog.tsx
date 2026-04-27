"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  pending = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCancel, pending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[linear-gradient(170deg,oklch(0.12_0.035_264/0.98),oklch(0.085_0.03_268/0.99))] shadow-[0_32px_90px_-50px_rgba(0,0,0,0.95)]">
        <div className="border-b border-white/[0.08] px-5 py-4">
          <p className="font-display text-[1.12rem] font-semibold tracking-[-0.025em] text-zinc-50">{title}</p>
          {description ? <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">{description}</p> : null}
        </div>
        {children ? <div className="px-5 pt-4">{children}</div> : null}
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.03] px-3.5 text-[13px] text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-xl border px-3.5 text-[13px] font-medium transition disabled:opacity-50",
              destructive
                ? "border-rose-500/35 bg-rose-500/[0.14] text-rose-100 hover:bg-rose-500/[0.2]"
                : "border-[oklch(0.58_0.12_252/0.45)] bg-[oklch(0.52_0.14_252/0.25)] text-zinc-100 hover:bg-[oklch(0.52_0.14_252/0.35)]",
            )}
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
