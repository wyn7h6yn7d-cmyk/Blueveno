import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { PlanTier } from "@/lib/billing/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }
        const demoOn = process.env.AUTH_DEMO === "true";
        const demoEmail = process.env.AUTH_DEMO_EMAIL;
        const demoPassword = process.env.AUTH_DEMO_PASSWORD;
        if (
          demoOn &&
          demoEmail &&
          demoPassword &&
          email === demoEmail &&
          password === demoPassword
        ) {
          return {
            id: "user_demo",
            email,
            name: "Demo trader",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id ?? token.sub;
      }
      /** Future: set token.planTier from DB user on sign-in. Demo override for billing UI: */
      const override = process.env.BILLING_PLAN_TIER_OVERRIDE;
      if (override === "free" || override === "pro" || override === "elite") {
        token.planTier = override;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      const pt = token.planTier;
      if (session.user && (pt === "free" || pt === "pro" || pt === "elite")) {
        session.user.planTier = pt as PlanTier;
      }
      return session;
    },
  },
});
