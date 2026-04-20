import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Blueveno plans — journal, analytics, and review tooling for serious traders.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    blurb: "Explore the workspace and core journaling.",
    features: ["Limited journal entries", "Basic overview", "Community support"],
    cta: "Start free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    blurb: "Full performance stack for operators.",
    features: [
      "Unlimited journal entries",
      "Advanced analytics",
      "Premium review & recaps",
      "Priority support",
    ],
    cta: "Upgrade (Stripe later)",
    href: "/login?callbackUrl=/app/settings/billing",
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-full overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-grid opacity-[0.35]" />
      <Navbar />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Pricing</p>
          <h1 className="font-display mt-4 text-4xl font-medium tracking-tight md:text-5xl">
            Plans that scale with your edge
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Stripe Checkout will attach to these tiers — scaffold only for now.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={cn(
                "flex flex-col border-border/80 bg-card/50 backdrop-blur-sm",
                t.highlight && "border-primary/30 ring-1 ring-primary/20",
              )}
            >
              <CardHeader>
                <CardTitle className="font-display text-xl">{t.name}</CardTitle>
                <CardDescription>{t.blurb}</CardDescription>
                <p className="font-display pt-4 text-4xl tabular-nums">
                  {t.price}
                  <span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {t.features.map((f) => (
                    <li key={f}>— {f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={t.href} className={cn(buttonVariants({ variant: t.highlight ? "default" : "outline" }), "w-full sm:w-auto")}>
                  {t.cta}
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
