import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlaceholderModuleProps = {
  title: string;
  description: string;
};

export function PlaceholderModule({ title, description }: PlaceholderModuleProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed border-border/80 bg-card/30">
        <CardHeader>
          <CardTitle className="font-display text-base text-muted-foreground">Module shell</CardTitle>
          <CardDescription>
            UI route is live; connect Prisma/Drizzle models and API handlers in the data phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 rounded-lg border border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        </CardContent>
      </Card>
    </div>
  );
}
