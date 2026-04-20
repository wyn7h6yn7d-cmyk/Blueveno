import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthSessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const space = Space_Grotesk({
  variable: "--font-space",
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
    default: "Blueveno — Trading performance intelligence",
    template: "%s — Blueveno",
  },
  description:
    "Premium trading journal and performance analytics—turn execution into evidence, review into edge, discipline into something you can measure.",
  openGraph: {
    title: "Blueveno — Trading performance intelligence",
    description:
      "The trading journal and analytics platform built for serious operators.",
    type: "website",
  },
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
        inter.variable,
        space.variable,
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
