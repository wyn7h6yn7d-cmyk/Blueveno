"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BluevenoLogoMark } from "@/components/brand/blueveno-logo-mark";
import { cn } from "@/lib/utils";

type CookieConsent = {
  necessary: true;
  thirdParty: boolean;
  marketing: boolean;
  updatedAt: string;
  version: number;
};

const CONSENT_VERSION = 1;
const STORAGE_KEY = "blueveno.cookie.consent";
const COOKIE_NAME = "blueveno_cookie_consent";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function parseConsent(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.version !== CONSENT_VERSION || typeof parsed.thirdParty !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }
    return {
      necessary: true,
      thirdParty: parsed.thirdParty,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      version: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

function readConsentFromCookie(): CookieConsent | null {
  try {
    const all = document.cookie ? document.cookie.split("; ") : [];
    const match = all.find((part) => part.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const encoded = match.slice(COOKIE_NAME.length + 1);
    return parseConsent(decodeURIComponent(encoded));
  } catch {
    return null;
  }
}

function buildConsent(thirdParty: boolean, marketing: boolean): CookieConsent {
  return {
    necessary: true,
    thirdParty,
    marketing,
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
}

function persistConsent(consent: CookieConsent) {
  const json = JSON.stringify(consent);
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Ignore storage write errors (private mode / strict browser policies).
  }
  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  } catch {
    // Ignore cookie write errors; local state still prevents immediate re-open.
  }
}

function readConsent(): CookieConsent | null {
  let fromStorage: CookieConsent | null = null;
  try {
    fromStorage = parseConsent(localStorage.getItem(STORAGE_KEY));
  } catch {
    fromStorage = null;
  }
  if (fromStorage) return fromStorage;
  return readConsentFromCookie();
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-zinc-100">{title}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-8 w-[3.2rem] shrink-0 rounded-full border transition",
          checked
            ? "border-emerald-400/60 bg-[oklch(0.52_0.16_150/0.95)] shadow-[0_0_22px_-10px_oklch(0.72_0.16_150/0.9)]"
            : "border-white/[0.18] bg-white/[0.14]",
          disabled && "cursor-not-allowed opacity-80",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white transition",
            checked ? "left-[1.45rem]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

export function CookieConsentModal() {
  const [isReady, setIsReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [thirdParty, setThirdParty] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const hasOptionalEnabled = useMemo(() => thirdParty || marketing, [thirdParty, marketing]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const existing = readConsent();
      if (existing) {
        setThirdParty(existing.thirdParty);
        setMarketing(existing.marketing);
        setOpen(false);
      } else {
        setOpen(true);
      }
      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    function onOpenSettings() {
      const existing = readConsent();
      if (existing) {
        setThirdParty(existing.thirdParty);
        setMarketing(existing.marketing);
      }
      setShowSettings(true);
      setOpen(true);
    }

    window.addEventListener("blueveno:open-cookie-settings", onOpenSettings);
    return () => window.removeEventListener("blueveno:open-cookie-settings", onOpenSettings);
  }, []);

  function acceptAll() {
    persistConsent(buildConsent(true, true));
    setThirdParty(true);
    setMarketing(true);
    setOpen(false);
  }

  function saveCurrent() {
    persistConsent(buildConsent(thirdParty, marketing));
    setOpen(false);
  }

  if (!isReady || !open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:p-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.14] bg-[linear-gradient(176deg,oklch(0.11_0.04_264/0.98),oklch(0.06_0.03_272/0.99))] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.95),0_0_60px_-34px_oklch(0.6_0.16_252/0.65)]">
        <div className="border-b border-white/[0.08] px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6">
          <div className="flex items-center gap-3">
            <BluevenoLogoMark className="size-8" />
            <p className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-zinc-50">Blueveno</p>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-200">
            We use cookies to keep the site reliable and secure, and to improve your experience. You can choose which
            optional cookie categories to allow.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            Learn more: <Link href="/cookies" className="underline underline-offset-4 hover:text-zinc-200">Cookie Policy</Link>,{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-zinc-200">Privacy Policy</Link>, and{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-zinc-200">Terms of Service</Link>.
          </p>
        </div>

        {(showSettings || hasOptionalEnabled) ? (
          <div className="space-y-3 border-b border-white/[0.08] px-5 py-4 sm:px-7 sm:py-5">
            <ToggleRow
              title="Necessary cookies"
              description="Required for core site functionality and cannot be disabled."
              checked
              disabled
              onChange={() => undefined}
            />
            <ToggleRow
              title="Third-party cookies"
              description="Help us measure service performance and improve user experience."
              checked={thirdParty}
              onChange={setThirdParty}
            />
            <ToggleRow
              title="Marketing cookies"
              description="Used to improve campaign and advertising relevance."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 px-5 py-4 sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex min-h-[2.7rem] items-center justify-center rounded-full border border-emerald-300/35 bg-[linear-gradient(180deg,oklch(0.58_0.18_150),oklch(0.46_0.15_152))] px-5 text-[15px] font-semibold text-white shadow-[0_0_42px_-16px_oklch(0.68_0.16_150/0.85)] transition hover:brightness-105"
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="inline-flex min-h-[2.7rem] items-center justify-center rounded-full border border-white/[0.18] bg-white/[0.05] px-5 text-[15px] font-medium text-zinc-100 transition hover:bg-white/[0.1]"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={saveCurrent}
            className="inline-flex min-h-[2.7rem] items-center justify-center rounded-full border border-white/[0.24] bg-transparent px-5 text-[15px] font-medium text-zinc-100 transition hover:bg-white/[0.06]"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
