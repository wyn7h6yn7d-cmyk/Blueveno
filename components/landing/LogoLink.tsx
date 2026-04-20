"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type LogoLinkProps = {
  children: ReactNode;
  className?: string;
};

/** Avalehele; kui juba avalehel, kerib sujuvalt lehe algusesse. */
export function LogoLink({ children, className }: LogoLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        if (pathname === "/") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
