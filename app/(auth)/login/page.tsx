import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Blueveno—a performance workspace for serious operators. Encrypted sessions; your journal and tape stay yours.",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  const { callbackUrl, error: errorParam } = await searchParams;
  if (session?.user) {
    redirect(callbackUrl ?? "/app");
  }

  return (
    <AuthSplitLayout
      variant="login"
      eyebrow="Sign in"
      title={
        <>
          Welcome <span className="text-gradient-cobalt">back</span>
        </>
      }
      subtitle="Return to your journal, analytics, and review history. Sessions are encrypted in transit; your tape stays under your control."
      alternatePrompt="New to Blueveno?"
      alternateHref="/signup"
      alternateLabel="Create an account"
      showDevHint={process.env.NODE_ENV === "development"}
    >
      <LoginForm callbackUrl={callbackUrl ?? "/app"} initialError={errorParam} />
    </AuthSplitLayout>
  );
}
