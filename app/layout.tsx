import type { Metadata, Viewport } from "next";
import { PRODUCT_DESCRIPTION, PRODUCT_TAGLINE } from "@/lib/product";
import { JetBrains_Mono, Plus_Jakarta_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Blueveno — ${PRODUCT_TAGLINE}`,
    template: "%s — Blueveno",
  },
  description: PRODUCT_DESCRIPTION,
  openGraph: {
    title: `Blueveno — ${PRODUCT_TAGLINE}`,
    description: PRODUCT_DESCRIPTION,
    type: "website",
  },
};

/** Matches `bv-void` / cinematic dark shell — browser chrome & splash tint */
export const viewport: Viewport = {
  themeColor: "#050a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full",
        sourceSans.variable,
        jakarta.variable,
        jetbrains.variable,
        "font-sans antialiased",
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
