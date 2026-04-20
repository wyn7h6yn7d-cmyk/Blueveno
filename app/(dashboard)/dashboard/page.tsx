import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardOverviewPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight md:text-3xl">
          Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Session snapshot and the metrics that matter—wired to real data next.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Net R (30d)",
            value: "—",
            hint: "Expectancy pipeline",
          },
          {
            title: "Win rate",
            value: "—",
            hint: "Tagged trades only",
          },
          {
            title: "Rule adherence",
            value: "—",
            hint: "Playbook vs. impulse",
          },
        ].map((k) => (
          <Card key={k.title} className="border-border/80 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription>{k.title}</CardDescription>
              <CardTitle className="font-display text-3xl tabular-nums">{k.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/80 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display text-base">Signed in</CardTitle>
          <CardDescription>
            {session?.user?.email} — journal ingestion and analytics API routes ship in the
            next milestone.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
