import { getStripe } from "@/lib/billing/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingSettingsPage() {
  const stripeReady = Boolean(getStripe() && process.env.STRIPE_WEBHOOK_SECRET);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Stripe Customer Portal and subscription entitlements — webhook at{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">/api/webhooks/stripe</code>.
        </p>
      </div>
      <Card className="border-border/80 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-base">Subscription</CardTitle>
          <CardDescription>
            {stripeReady
              ? "Stripe keys detected. Add Checkout / Portal routes when plans go live."
              : "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to activate billing flows."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" disabled={!stripeReady}>
            Manage billing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
