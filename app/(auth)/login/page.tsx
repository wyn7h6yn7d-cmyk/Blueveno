import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolvePostAuthLanding } from "@/lib/auth/post-auth-landing.server";
import { safeAppRedirectPath } from "@/lib/auth/safe-redirect-path";
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
  const { callbackUrl: rawCallback, error: errorParam } = await searchParams;
  const callbackUrl = safeAppRedirectPath(rawCallback ?? null);

  if (session?.user) {
    const landing = await resolvePostAuthLanding(session);
    if (landing === "account_disabled") {
      redirect("/account-disabled");
    }
    if (landing === "app") {
      redirect(callbackUrl);
    }
    /* profile_error: stay on login — session exists but profile/access could not be loaded */
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
      <LoginForm
        callbackUrl={callbackUrl}
        initialError={errorParam}
        sessionWithoutProfile={Boolean(session?.user)}
      />
    </AuthSplitLayout>
  );
}
