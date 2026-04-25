import { cn } from "@/lib/utils";

type BluevenoLogoMarkProps = {
  className?: string;
};

export function BluevenoLogoMark({ className }: BluevenoLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      role="img"
      aria-label="Blueveno"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bv-mark-main" x1="7" y1="5" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7AA5FF" />
          <stop offset="52%" stopColor="#3F72FF" />
          <stop offset="100%" stopColor="#1E49CC" />
        </linearGradient>
        <linearGradient id="bv-mark-top" x1="9" y1="4" x2="20" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B5CEFF" />
          <stop offset="100%" stopColor="#5B88FF" />
        </linearGradient>
      </defs>
      <path
        d="M9.4 5.2h6.4c4 0 6.3 2.1 6.3 5.1 0 2.2-1.4 3.6-3.2 4.2 2.3.6 4.1 2.4 4.1 5.1 0 3.5-2.7 6-7.3 6H8.9L12.4 20H15c1.7 0 2.7-.8 2.7-2.1 0-1.3-1.1-2-2.7-2h-4l3-4.5h1.5c1.5 0 2.4-.7 2.4-1.9 0-1.2-.9-1.9-2.4-1.9h-2.8L9.4 5.2Z"
        fill="url(#bv-mark-main)"
      />
      <path d="M9.4 5.2h6.2c2 0 3.8.5 5 1.6L14 11.4h-1.2L9.4 5.2Z" fill="url(#bv-mark-top)" opacity="0.82" />
    </svg>
  );
}
