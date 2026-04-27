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
    "Sign in to Blueveno to continue your journal, behavior review, and trading-account workflow.",
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    url: "/login",
    title: "Sign in — Blueveno",
    description:
      "Sign in to Blueveno to continue your journal, behavior review, and trading-account workflow.",
  },
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
      subtitle="Return to your journal, linked chart workflow, and review history. Keep your history visible in read-only after trial."
      alternatePrompt="New to Blueveno?"
      alternateHref="/signup"
      alternateLabel="Create an account"
    >
      <LoginForm
        callbackUrl={callbackUrl}
        initialError={errorParam}
        sessionWithoutProfile={Boolean(session?.user)}
      />
    </AuthSplitLayout>
  );
}
