import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Blueveno: trading journal and performance review with encrypted sessions and careful data handling.",
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
    <AuthSplitLayout
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Access your journal, analytics, and review history. Sessions are encrypted in transit; your tape stays yours."
      alternatePrompt="New to Blueveno?"
      alternateHref="/signup"
      alternateLabel="Create an account"
      showDevHint={process.env.NODE_ENV === "development"}
    >
      <LoginForm callbackUrl={callbackUrl ?? "/app"} />
    </AuthSplitLayout>
  );
}
