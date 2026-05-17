"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: number;
  tone: ToastTone;
  text: string;
};

type ToastInput = {
  tone: ToastTone;
  text: string;
  durationMs?: number;
};

type AppToastContextValue = {
  push: (input: ToastInput) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
  dismiss: (id: number) => void;
};

const AppToastContext = createContext<AppToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  success:
    "border-emerald-400/32 bg-[linear-gradient(165deg,oklch(0.16_0.06_160/0.96),oklch(0.11_0.04_160/0.94))] text-emerald-50 shadow-[0_20px_56px_-28px_oklch(0.4_0.12_155/0.5)]",
  error:
    "border-rose-400/32 bg-[linear-gradient(165deg,oklch(0.16_0.06_20/0.96),oklch(0.11_0.04_18/0.94))] text-rose-50 shadow-[0_20px_56px_-28px_oklch(0.45_0.12_15/0.45)]",
  info:
    "border-[oklch(0.55_0.12_252/0.32)] bg-[linear-gradient(165deg,oklch(0.15_0.04_258/0.96),oklch(0.1_0.032_266/0.94))] text-zinc-100 shadow-[0_20px_56px_-28px_oklch(0.45_0.14_252/0.35)]",
};

export function AppToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ tone, text, durationMs = 3400 }: ToastInput) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, tone, text: trimmed }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss],
  );

  const success = useCallback((text: string) => push({ tone: "success", text }), [push]);
  const error = useCallback((text: string) => push({ tone: "error", text }), [push]);
  const info = useCallback((text: string) => push({ tone: "info", text }), [push]);

  const value = useMemo(
    () => ({ push, success, error, info, dismiss }),
    [push, success, error, info, dismiss],
  );

  return (
    <AppToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[200] flex max-w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </AppToastContext.Provider>
  );
}

function ToastCard({ toast }: { toast: ToastItem; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto rounded-xl border px-4 py-3 text-[13px] leading-snug shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08)]",
        toneClass[toast.tone],
      )}
    >
      {toast.text}
    </div>
  );
}

export function useAppToast(): AppToastContextValue {
  const ctx = useContext(AppToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used within AppToastProvider");
  }
  return ctx;
}

/** Safe when provider may be absent (e.g. tests) */
export function useAppToastOptional(): AppToastContextValue | null {
  return useContext(AppToastContext);
}
