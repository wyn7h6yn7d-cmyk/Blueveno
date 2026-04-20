import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeatureKey } from "@/lib/features";

const COPY: Record<
  FeatureKey,
  { title: string; description: string }
> = {
  "journal.create": {
    title: "Create unlimited journal entries",
    description: "Upgrade to log every execution without limits.",
  },
  "analytics.advanced": {
    title: "Unlock advanced analytics",
    description: "Regime slices, distributions, and deeper performance breakdowns.",
  },
  "reviews.premium": {
    title: "Premium review tools",
    description: "Annotation layers, structured recaps, and exportable review packs.",
  },
};

type UpgradePromptProps = {
  feature: FeatureKey;
};

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const c = COPY[feature];
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="font-display text-base">{c.title}</CardTitle>
        <CardDescription>{c.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Link href="/pricing" className={cn(buttonVariants({ variant: "default" }))}>
          View plans
        </Link>
        <Link href="/app/settings/billing" className={cn(buttonVariants({ variant: "outline" }))}>
          Billing
        </Link>
      </CardContent>
    </Card>
  );
}
