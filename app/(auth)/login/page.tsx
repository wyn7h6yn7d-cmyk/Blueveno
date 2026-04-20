import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in — Blueveno",
  description: "Sign in to your Blueveno workspace.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) {
    redirect(callbackUrl ?? "/app");
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="font-display text-2xl font-medium tracking-tight text-foreground">
          Blueveno
        </p>
        <h1 className="mt-3 text-lg text-muted-foreground">
          Sign in to your performance workspace
        </h1>
      </div>
      <LoginForm callbackUrl={callbackUrl ?? "/app"} />
      <p className="text-center text-xs text-muted-foreground">
        Demo: set <code className="rounded bg-muted px-1 py-0.5 font-mono">AUTH_DEMO=true</code>{" "}
        and credentials from <code className="rounded bg-muted px-1 py-0.5 font-mono">.env</code>.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
