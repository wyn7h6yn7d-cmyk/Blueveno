"use client";

type OpenCookieSettingsButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function OpenCookieSettingsButton({ className, children = "Manage cookies" }: OpenCookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("blueveno:open-cookie-settings"));
      }}
      className={className}
    >
      {children}
    </button>
  );
}
